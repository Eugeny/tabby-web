from concurrent.futures import ThreadPoolExecutor
from threading import Event
from time import monotonic
from unittest import skipUnless
from unittest.mock import patch

from django.db import connection, connections
from django.test import TransactionTestCase
from rest_framework.test import APIRequestFactory, force_authenticate

from .api.config import ConfigViewSet
from .models import Config, User


class ConfigSyncTests(TransactionTestCase):
    def setUp(self):
        self.owner = User.objects.create_user(username="sync-owner")
        self.other = User.objects.create_user(username="other-owner")
        self.config = Config.objects.create(
            user=self.owner, name="fixture", content="profiles: []\n"
        )

    def request(self, method, data=None, user=None, revision=None):
        headers = {} if revision is None else {"HTTP_X_TABBY_EXPECTED_REVISION": revision}
        request = getattr(APIRequestFactory(), method)("/fixture/", data, format="json", **headers)
        force_authenticate(request, user=user or self.owner)
        action = {"get": "retrieve", "patch": "partial_update", "put": "update"}[method]
        return ConfigViewSet.as_view({method: action})(request, pk=self.config.pk)

    def revision(self):
        return self.request("get").data["modified_at"]

    def test_content_round_trips_verbatim(self):
        content = "banner: |+\n  keep trailing whitespace  \n\n"
        response = self.request("patch", {"content": content})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(self.request("get").data["content"], content)

    def test_unchanged_upload_and_client_metadata_keep_revision(self):
        before = self.revision()
        response = self.request("patch", {
            "content": self.config.content, "last_used_with_version": "fixture-version"
        })
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["modified_at"], before)
        self.config.refresh_from_db()
        self.assertEqual(self.config.last_used_with_version, "fixture-version")

    def test_optional_revision_rejects_stale_write(self):
        before = self.revision()
        first = self.request("patch", {"content": "profiles: [first]"}, revision=before)
        self.assertEqual(first.status_code, 200)
        stale = self.request("patch", {"content": "profiles: [stale]"}, revision=before)
        self.assertEqual(stale.status_code, 412)
        self.assertEqual(stale.data, {"code": "revision_changed"})
        self.assertEqual(self.request("get").data["content"], "profiles: [first]")

    def test_legacy_put_remains_supported(self):
        response = self.request("put", {"name": "renamed", "content": "profiles: [legacy]"})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["name"], "renamed")

    def test_rename_changes_revision(self):
        before = self.revision()
        response = self.request("patch", {"name": "renamed"}, revision=before)
        self.assertEqual(response.status_code, 200)
        self.assertNotEqual(response.data["modified_at"], before)

    def test_ownership_is_checked_before_revision(self):
        response = self.request("patch", {"content": "wrong-owner"},
                                user=self.other, revision="stale")
        self.assertEqual(response.status_code, 404)
        self.config.refresh_from_db()
        self.assertEqual(self.config.content, "profiles: []\n")

    def test_invalid_payload_does_not_modify_config(self):
        before = self.revision()
        response = self.request("patch", {"content": {"invalid": "mapping"}}, revision=before)
        self.assertEqual(response.status_code, 400)
        self.assertEqual(self.revision(), before)

    @skipUnless(connection.vendor == "postgresql", "Row-lock observation requires PostgreSQL")
    def test_concurrent_writers_cannot_both_use_same_revision(self):
        before = self.revision()
        entered = Event()
        release = Event()
        second_started = Event()
        second_pid = []
        writes = []
        original = ConfigViewSet.perform_update

        def held_update(view, serializer):
            writes.append(serializer.validated_data["content"])
            entered.set()
            if not release.wait(10):
                raise AssertionError("Timed out waiting to release fixture row lock")
            return original(view, serializer)

        def writer(content, started=None):
            try:
                if started is not None:
                    with connections["default"].cursor() as cursor:
                        cursor.execute("SELECT pg_backend_pid()")
                        second_pid.append(cursor.fetchone()[0])
                    started.set()
                return self.request("patch", {"content": content}, revision=before).status_code
            finally:
                connections.close_all()

        with patch.object(ConfigViewSet, "perform_update", held_update):
            with ThreadPoolExecutor(max_workers=2) as pool:
                first = pool.submit(writer, "profiles: [first]")
                try:
                    self.assertTrue(entered.wait(10))
                    second = pool.submit(writer, "profiles: [second]", second_started)
                    self.assertTrue(second_started.wait(10))
                    # Observe a database lock wait, not just a stale write
                    # after the first request has already finished.
                    blocked = False
                    deadline = monotonic() + 10
                    while monotonic() < deadline and not second.done():
                        with connection.cursor() as cursor:
                            cursor.execute(
                                "SELECT wait_event_type FROM pg_stat_activity WHERE pid = %s",
                                [second_pid[0]],
                            )
                            blocked = cursor.fetchone() == ("Lock",)
                        if blocked:
                            break
                        Event().wait(0.02)
                    self.assertTrue(blocked, "Second writer did not wait for the row lock")
                finally:
                    release.set()
                self.assertEqual(first.result(timeout=10), 200)
                self.assertEqual(second.result(timeout=10), 412)
        self.assertEqual(writes, ["profiles: [first]"])
