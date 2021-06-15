import os
from dataclasses import dataclass
from django.conf import settings
from django.contrib.auth import logout
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.mixins import ListModelMixin, RetrieveModelMixin
from rest_framework.views import APIView
from rest_framework.viewsets import GenericViewSet, ModelViewSet
from rest_framework.serializers import ModelSerializer
from rest_framework_dataclasses.serializers import DataclassSerializer

from .models import Config


@dataclass
class AppVersion:
    version: str


class AppVersionSerializer(DataclassSerializer):
    class Meta:
        dataclass = AppVersion


class ConfigSerializer(ModelSerializer):
    class Meta:
        model = Config
        read_only_fields = ('user', 'created_at', 'modified_at')
        fields = '__all__'


class ConfigViewSet(ModelViewSet):
    queryset = Config.objects.all()
    serializer_class = ConfigSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        if self.request.user.is_authenticated:
            return Config.objects.filter(user=self.request.user)
        return Config.objects.none()

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class AppVersionViewSet(ListModelMixin, GenericViewSet):
    serializer_class = AppVersionSerializer
    lookup_field = 'id'
    lookup_value_regex = r'[\w\d.-]+'
    queryset = ''
    permission_classes = [IsAuthenticated]

    def _get_versions(self):
        return [AppVersion(version=x) for x in os.listdir(settings.APP_DIST_PATH)]

    def list(self, request, *args, **kwargs):
        return Response(self.serializer_class(
            self._get_versions(),
            many=True,
        ).data)


class LogoutView(APIView):
    def post(self, request, format=None):
        logout(request)
