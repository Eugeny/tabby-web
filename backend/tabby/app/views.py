import fsspec
from django.conf import settings
from django.http.response import HttpResponseRedirect
from django.views import static
from rest_framework.views import APIView
from urllib.parse import urlparse


class IndexView(APIView):
    def get(self, request, format=None):
        return static.serve(request, 'index.html', document_root=str(settings.FRONTEND_BUILD_DIR))


class TerminalView(APIView):
    def get(self, request, format=None):
        response = static.serve(request, 'terminal.html', document_root=str(settings.FRONTEND_BUILD_DIR))
        response['X-Frame-Options'] = 'SAMEORIGIN'
        return response


class AppDistView(APIView):
    def get(self, request, version=None, path=None, format=None):
        fs = fsspec.filesystem(urlparse(settings.APP_DIST_STORAGE).scheme)
        url = f'{settings.APP_DIST_STORAGE}/{version}/{path}'
        return HttpResponseRedirect(fs.url(url))
