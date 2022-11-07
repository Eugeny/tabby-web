import fsspec
import os
from django.conf import settings
from django.utils.decorators import method_decorator
from django.views.decorators.cache import cache_page
from dataclasses import dataclass
from rest_framework.response import Response
from rest_framework.mixins import ListModelMixin
from rest_framework.viewsets import GenericViewSet
from rest_framework_dataclasses.serializers import DataclassSerializer
from typing import List
from urllib.parse import urlparse


@dataclass
class AppVersion:
    version: str
    plugins: List[str]


class AppVersionSerializer(DataclassSerializer):
    class Meta:
        dataclass = AppVersion


class AppVersionViewSet(ListModelMixin, GenericViewSet):
    serializer_class = AppVersionSerializer
    lookup_field = "id"
    lookup_value_regex = r"[\w\d.-]+"
    queryset = ""

    def _get_versions(self):
        fs = fsspec.filesystem(urlparse(settings.APP_DIST_STORAGE).scheme)
        return [
            self._get_version(x["name"])
            for x in fs.listdir(settings.APP_DIST_STORAGE)
            if x["type"] == "directory"
        ]

    def _get_version(self, dir):
        fs = fsspec.filesystem(urlparse(settings.APP_DIST_STORAGE).scheme)
        plugins = [
            os.path.basename(x["name"])
            for x in fs.listdir(dir)
            if x["type"] == "directory"
            and os.path.basename(x["name"])
            not in [
                "tabby-web-container",
                "tabby-web-demo",
            ]
        ]

        return AppVersion(
            version=os.path.basename(dir),
            plugins=plugins,
        )

    @method_decorator(cache_page(60))
    def list(self, request, *args, **kwargs):
        return Response(
            self.serializer_class(
                self._get_versions(),
                many=True,
            ).data
        )
