import fsspec
import os
import asyncio
import random
from django.conf import settings
from django.contrib.auth import logout
from dataclasses import dataclass
from pathlib import Path
from rest_framework import fields, status
from rest_framework.exceptions import APIException, PermissionDenied, NotFound
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.mixins import ListModelMixin, RetrieveModelMixin, UpdateModelMixin
from rest_framework.views import APIView
from rest_framework.viewsets import GenericViewSet, ModelViewSet
from rest_framework.serializers import ModelSerializer, Serializer
from rest_framework_dataclasses.serializers import DataclassSerializer
from social_django.models import UserSocialAuth
from typing import List
from urllib.parse import urlparse

from .gateway import GatewayAdminConnection
from .sponsors import check_is_sponsor, check_is_sponsor_cached
from .models import Config, Gateway, User


@dataclass
class AppVersion:
    version: str
    plugins: List[str]


class AppVersionSerializer(DataclassSerializer):
    class Meta:
        dataclass = AppVersion


class GatewaySerializer(ModelSerializer):
    url = fields.SerializerMethodField()
    auth_token = fields.CharField()

    class Meta:
        fields = '__all__'
        model = Gateway

    def get_url(self, gw):
        return f'{"wss" if gw.secure else "ws"}://{gw.host}:{gw.port}/'


class ConfigSerializer(ModelSerializer):
    name = fields.CharField(required=False)

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
        fs = fsspec.filesystem(urlparse(settings.APP_DIST_STORAGE).scheme)
        return [
            self._get_version(x['name'])
            for x in fs.listdir(settings.APP_DIST_STORAGE)
        ]

    def _get_version(self, dir):
        fs = fsspec.filesystem(urlparse(settings.APP_DIST_STORAGE).scheme)
        plugins = [
            os.path.basename(x['name'])
            for x in fs.listdir(dir)
            if x['type'] == 'directory' and os.path.basename(x['name'])
            not in [
                'tabby-web-container',
                'tabby-web-demo',
            ]
        ]

        return AppVersion(
            version=os.path.basename(dir),
            plugins=plugins,
        )

    def list(self, request, *args, **kwargs):
        return Response(
            self.serializer_class(
                self._get_versions(),
                many=True,
            ).data
        )


class UserSerializer(ModelSerializer):
    id = fields.IntegerField()
    is_pro = fields.SerializerMethodField()
    is_sponsor = fields.SerializerMethodField()
    github_username = fields.SerializerMethodField()

    class Meta:
        model = User
        fields = (
            'id',
            'username',
            'active_config',
            'custom_connection_gateway',
            'custom_connection_gateway_token',
            'config_sync_token',
            'is_pro',
            'is_sponsor',
            'github_username',
        )
        read_only_fields = ('id', 'username')

    def get_is_pro(self, obj):
        return obj.force_pro or not settings.GITHUB_ELIGIBLE_SPONSORSHIPS or check_is_sponsor_cached(obj)

    def get_is_sponsor(self, obj):
        return check_is_sponsor_cached(obj)

    def get_github_username(self, obj):
        social_auth = UserSocialAuth.objects.filter(user=obj, provider='github').first()
        if not social_auth:
            return None

        return social_auth.extra_data.get('login')


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
    homepage_enabled = fields.BooleanField()


class InstanceInfoViewSet(RetrieveModelMixin, GenericViewSet):
    queryset = ''  # type: ignore
    serializer_class = InstanceInfoSerializer

    def get_object(self):
        return {
            'login_enabled': settings.ENABLE_LOGIN,
            'homepage_enabled': settings.ENABLE_HOMEPAGE,
        }


class NoGatewaysError(APIException):
    status_code = status.HTTP_503_SERVICE_UNAVAILABLE
    default_detail = 'No connection gateways available.'
    default_code = 'no_gateways'


class ChooseGatewayViewSet(RetrieveModelMixin, GenericViewSet):
    queryset = Gateway.objects.filter(enabled=True)
    serializer_class = GatewaySerializer

    async def _authorize_client(self, gw):
        c = GatewayAdminConnection(gw)
        await c.connect()
        token = await c.authorize_client()
        await c.close()
        return token

    def get_object(self):
        gateways = list(self.queryset)
        random.shuffle(gateways)
        if not len(gateways):
            raise NotFound()

        loop = asyncio.new_event_loop()
        try:
            for gw in gateways:
                try:
                    gw.auth_token = loop.run_until_complete(self._authorize_client(gw))
                except ConnectionError:
                    continue
                return gw

            raise NoGatewaysError()
        finally:
            loop.close()
