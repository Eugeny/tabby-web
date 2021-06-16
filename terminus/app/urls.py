from django.urls import path, include
from rest_framework import routers

from . import api
from . import consumers
from . import views


router = routers.DefaultRouter(trailing_slash=False)
router.register('api/1/configs', api.ConfigViewSet)
router.register('api/1/versions', api.AppVersionViewSet, basename='app-versions')

urlpatterns = [
    path('api/1/auth/logout', api.LogoutView.as_view()),
    path('api/1/user', api.UserViewSet.as_view({'get': 'retrieve'})),

    path('', views.IndexView.as_view()),
    path('terminal', views.TerminalView.as_view()),
    path('app-dist/<version>/<path:path>', views.AppDistView.as_view()),
    path('build/<path:path>', views.BuildView.as_view()),
    path('', include(router.urls)),
]

websocket_urlpatterns = [
    path('api/1/gateway/tcp', consumers.TCPConsumer.as_asgi()),
]
