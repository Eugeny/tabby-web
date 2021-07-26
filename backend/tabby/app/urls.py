from django.urls import path, re_path, include
from rest_framework import routers

from . import api
from . import views


router = routers.DefaultRouter(trailing_slash=False)
router.register('api/1/configs', api.ConfigViewSet)
router.register('api/1/versions', api.AppVersionViewSet, basename='app-versions')

urlpatterns = [
    path('api/1/auth/logout', api.LogoutView.as_view()),
    path('api/1/user', api.UserViewSet.as_view({'get': 'retrieve', 'put': 'update'})),
    path('api/1/instance-info', api.InstanceInfoViewSet.as_view({'get': 'retrieve'})),
    path('api/1/gateways/choose', api.ChooseGatewayViewSet.as_view({'post': 'retrieve'})),

    re_path('^(|login|app)$', views.IndexView.as_view()),
    path('terminal', views.TerminalView.as_view()),

    path('app-dist/<version>/<path:path>', views.AppDistView.as_view()),
    path('', include(router.urls)),
]
