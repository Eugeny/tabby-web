from django.conf import settings
from django.contrib.staticfiles.views import serve
from django.http.response import HttpResponse
from rest_framework.views import APIView
from django.views import static


class IndexView(APIView):
    def get(self, request, format=None):
        return static.serve(request, 'terminal.html', document_root=str(settings.BASE_DIR / 'dist'))


class AppDistView(APIView):
    def get(self, request, path=None, format=None):
        return static.serve(request, path, document_root=str(settings.BASE_DIR / 'app-dist'))


class DistView(APIView):
    def get(self, request, path=None, format=None):
        return static.serve(request, path, document_root=str(settings.BASE_DIR / 'dist'))
