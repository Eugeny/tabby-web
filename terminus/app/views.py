import os
from django.conf import settings
from django.views import static
from rest_framework.views import APIView


class IndexView(APIView):
    def get(self, request, format=None):
        return static.serve(request, 'index.html', document_root=str(settings.BASE_DIR / 'build'))


class TerminalView(APIView):
    def get(self, request, format=None):
        response = static.serve(request, 'terminal.html', document_root=str(settings.BASE_DIR / 'build'))
        response['X-Frame-Options'] = 'SAMEORIGIN'
        return response


class AppDistView(APIView):
    def get(self, request, version=None, path=None, format=None):
        return static.serve(request, os.path.join(version, path), document_root=str(settings.APP_DIST_PATH))


class BuildView(APIView):
    def get(self, request, path=None, format=None):
        return static.serve(request, path, document_root=str(settings.BASE_DIR / 'build'))
