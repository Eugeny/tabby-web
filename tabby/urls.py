from django.conf import settings
from django.contrib import admin
from django.urls import path, include
from django.views.static import serve
from .app.urls import urlpatterns as app_urlpatterns

urlpatterns = [
    path('', include(app_urlpatterns)),
    path('api/1/auth/social/', include('social_django.urls', namespace='social')),
    path('admin/', admin.site.urls),
    path(f'^{settings.STATIC_URL}<path:path>', serve, kwargs={
        'document_root': settings.STATIC_ROOT,
    }),
]
