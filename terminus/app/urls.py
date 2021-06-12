from django.urls import path, include
from rest_framework import routers
from . import consumers
from . import views


router = routers.DefaultRouter(trailing_slash=False)
# router.register('api/2/auth/saml', SAMLProviderViewSet)

urlpatterns = [
    path('', views.IndexView.as_view()),
    path('app-dist/<path:path>', views.AppDistView.as_view()),
    path('dist/<path:path>', views.DistView.as_view()),
    path('', include(router.urls)),
]

websocket_urlpatterns = [
    path('api/1/gateway/tcp', consumers.TCPConsumer.as_asgi()),
]
