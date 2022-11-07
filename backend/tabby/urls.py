from django.contrib import admin
from django.urls import path, include

from .app.urls import urlpatterns as app_urlpatterns

urlpatterns = [
    path("", include(app_urlpatterns)),
    path("api/1/auth/social/", include("social_django.urls", namespace="social")),
    path("admin/", admin.site.urls),
]
