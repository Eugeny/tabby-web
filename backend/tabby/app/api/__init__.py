from django.urls import path, include
from rest_framework import routers
from . import app_version, auth, config, gateway, user, system


router = routers.DefaultRouter(trailing_slash=False)
router.register("api/1/configs", config.ConfigViewSet)
router.register(
    "api/1/versions", app_version.AppVersionViewSet, basename="app-versions"
)

urlpatterns = [
    # Auth endpoints
    path("api/1/auth/logout", auth.LogoutView.as_view()),
    path("api/1/auth/status", auth.AuthStatusView.as_view()),
    path("api/1/auth/local/login", auth.LocalLoginView.as_view()),
    path("api/1/auth/local/register", auth.LocalRegisterView.as_view()),
    path("api/1/auth/change-password", auth.ChangePasswordView.as_view()),

    # User endpoints
    path("api/1/user", user.UserViewSet.as_view({"get": "retrieve", "put": "update"})),

    # Gateway endpoints
    path(
        "api/1/gateways/choose",
        gateway.ChooseGatewayViewSet.as_view({"post": "retrieve"}),
    ),

    # System endpoints
    path("api/1/version", system.VersionView.as_view()),
    path("health", system.HealthCheckView.as_view()),
    path("ready", system.ReadinessCheckView.as_view()),
    path("live", system.LivenessCheckView.as_view()),

    # Router URLs
    path("", include(router.urls)),
]
