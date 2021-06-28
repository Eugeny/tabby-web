import os
from dataclasses import dataclass
from django.conf import settings
from django.contrib.auth import logout
from rest_framework import fields
from rest_framework.exceptions import PermissionDenied
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.mixins import ListModelMixin, RetrieveModelMixin, UpdateModelMixin
from rest_framework.views import APIView
from rest_framework.viewsets import GenericViewSet, ModelViewSet
from rest_framework.serializers import ModelSerializer, Serializer
from rest_framework_dataclasses.serializers import DataclassSerializer

from .models import Config, User


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

    def _get_versions(self):
        return [AppVersion(version=x) for x in os.listdir(settings.APP_DIST_PATH)]

    def list(self, request, *args, **kwargs):
        return Response(self.serializer_class(
            self._get_versions(),
            many=True,
        ).data)


class UserSerializer(ModelSerializer):
    id = fields.IntegerField()
    is_pro = fields.SerializerMethodField()

    class Meta:
        model = User
        fields = ('id', 'username', 'active_config', 'custom_connection_gateway', 'custom_connection_gateway_token', 'is_pro')
        read_only_fields = ('id', 'username')

    def get_is_pro(self, obj):
        return False


class UserViewSet(RetrieveModelMixin, UpdateModelMixin, GenericViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer

    def get_object(self):
        if self.request.user.is_authenticated:
            return self.request.user
        raise PermissionDenied()


class LogoutView(APIView):
    def post(self, request, format=None):
        logout(request)
        return Response(None)


class InstanceInfoSerializer(Serializer):
    login_enabled = fields.BooleanField()


class InstanceInfoViewSet(RetrieveModelMixin, GenericViewSet):
    queryset = ''  # type: ignore
    serializer_class = InstanceInfoSerializer

    def get_object(self):
        return {
            'login_enabled': settings.ENABLE_LOGIN,
        }
