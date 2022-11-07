from django.conf import settings
from rest_framework import fields
from rest_framework.exceptions import PermissionDenied
from rest_framework.mixins import RetrieveModelMixin, UpdateModelMixin
from rest_framework.viewsets import GenericViewSet
from rest_framework.serializers import ModelSerializer
from social_django.models import UserSocialAuth

from ..sponsors import check_is_sponsor_cached
from ..models import User


class UserSerializer(ModelSerializer):
    id = fields.IntegerField()
    is_pro = fields.SerializerMethodField()
    is_sponsor = fields.SerializerMethodField()
    github_username = fields.SerializerMethodField()

    class Meta:
        model = User
        fields = (
            "id",
            "username",
            "active_config",
            "custom_connection_gateway",
            "custom_connection_gateway_token",
            "config_sync_token",
            "is_pro",
            "is_sponsor",
            "github_username",
        )
        read_only_fields = ("id", "username")

    def get_is_pro(self, obj):
        return (
            obj.force_pro
            or not settings.GITHUB_ELIGIBLE_SPONSORSHIPS
            or check_is_sponsor_cached(obj)
        )

    def get_is_sponsor(self, obj):
        return check_is_sponsor_cached(obj)

    def get_github_username(self, obj):
        social_auth = UserSocialAuth.objects.filter(user=obj, provider="github").first()
        if not social_auth:
            return None

        return social_auth.extra_data.get("login")


class UserViewSet(RetrieveModelMixin, UpdateModelMixin, GenericViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer

    def get_object(self):
        if self.request.user.is_authenticated:
            return self.request.user
        raise PermissionDenied()
