from django.contrib import admin
from django.urls import path, include
from .app.urls import urlpatterns

urlpatterns = [
    path('', include(urlpatterns)),
    path('api/1/auth/social/', include('social_django.urls', namespace='social')),
    path('admin/', admin.site.urls),
]
