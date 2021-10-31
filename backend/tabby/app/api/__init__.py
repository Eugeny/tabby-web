from django.urls import path, include
from rest_framework import routers
from . import app_version, auth, config, gateway, info, user


router = routers.DefaultRouter(trailing_slash=False)
router.register('api/1/configs', config.ConfigViewSet)
router.register('api/1/versions', app_version.AppVersionViewSet, basename='app-versions')

urlpatterns = [
    path('api/1/auth/logout', auth.LogoutView.as_view()),
    path('api/1/user', user.UserViewSet.as_view({'get': 'retrieve', 'put': 'update'})),
    path('api/1/instance-info', info.InstanceInfoViewSet.as_view({'get': 'retrieve'})),
    path('api/1/gateways/choose', gateway.ChooseGatewayViewSet.as_view({'post': 'retrieve'})),


    path('', include(router.urls)),
]
