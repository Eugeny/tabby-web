import fsspec
import os
from fsspec.implementations.local import LocalFileSystem
from django.conf import settings
from django.http.response import FileResponse, HttpResponseNotFound, HttpResponseRedirect
from django.views import static
from rest_framework.views import APIView
from urllib.parse import urlparse


class IndexView(APIView):
    def get(self, request, format=None):
        if settings.FRONTEND_URL:
            return HttpResponseRedirect(settings.FRONTEND_URL)
        return static.serve(request, 'index.html', document_root=str(settings.STATIC_ROOT))


class TerminalView(APIView):
    def get(self, request, format=None):
        response = static.serve(request, 'terminal.html', document_root=str(settings.STATIC_ROOT))
        response['X-Frame-Options'] = 'SAMEORIGIN'
        return response


class DemoView(APIView):
    def get(self, request, format=None):
        response = static.serve(request, 'demo.html', document_root=str(settings.STATIC_ROOT))
        response['Content-Security-Policy'] = 'frame-ancestors https://tabby.sh'
        return response


class AppDistView(APIView):
    def get(self, request, version=None, path=None, format=None):
        fs = fsspec.filesystem(urlparse(settings.APP_DIST_STORAGE).scheme)
        url = f'{settings.APP_DIST_STORAGE}/{version}/{path}'
        if isinstance(fs, LocalFileSystem):
            if not fs.exists(url):
                return HttpResponseNotFound()
            return FileResponse(fs.open(url), filename=os.path.basename(url))
        else:
            return HttpResponseRedirect(fs.url(url))
