from rest_framework import fields
from rest_framework.permissions import IsAuthenticated
from rest_framework.viewsets import ModelViewSet
from rest_framework.serializers import ModelSerializer
from rest_framework.response import Response
from django.db import transaction
from ..models import Config


class ConfigSerializer(ModelSerializer):
    name = fields.CharField(required=False)
    # YAML block scalars can contain significant trailing whitespace.
    content = fields.CharField(required=False, allow_blank=True, trim_whitespace=False)

    class Meta:
        model = Config
        read_only_fields = ("user", "created_at", "modified_at")
        fields = "__all__"


class ConfigViewSet(ModelViewSet):
    queryset = Config.objects.all()
    serializer_class = ConfigSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        if self.request.user.is_authenticated:
            queryset = Config.objects.filter(user=self.request.user)
            if getattr(self, "_lock_config", False):
                queryset = queryset.select_for_update()
            return queryset
        return Config.objects.none()

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @transaction.atomic
    def update(self, request, *args, **kwargs):
        self._lock_config = True
        instance = self.get_object()
        expected = request.headers.get("X-Tabby-Expected-Revision")
        current = self.get_serializer(instance).data["modified_at"]
        if expected is not None and expected != current:
            return Response({"code": "revision_changed"}, status=412)
        serializer = self.get_serializer(
            instance, data=request.data, partial=kwargs.get("partial", False)
        )
        serializer.is_valid(raise_exception=True)
        values = serializer.validated_data
        same_content = values.get("content", instance.content) == instance.content
        same_name = values.get("name", instance.name) == instance.name
        if same_content and same_name:
            # A client version update is metadata, not a new config revision.
            if "last_used_with_version" in values:
                version = values["last_used_with_version"]
                Config.objects.filter(pk=instance.pk).update(last_used_with_version=version)
                instance.last_used_with_version = version
            return Response(self.get_serializer(instance).data)
        self.perform_update(serializer)
        if getattr(instance, "_prefetched_objects_cache", None):
            instance._prefetched_objects_cache = {}
        return Response(serializer.data)
