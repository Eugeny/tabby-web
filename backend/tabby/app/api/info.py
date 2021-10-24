from django.conf import settings
from rest_framework import fields
from rest_framework.mixins import RetrieveModelMixin
from rest_framework.viewsets import GenericViewSet
from rest_framework.serializers import Serializer


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
