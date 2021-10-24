from django.contrib.auth import logout
from rest_framework.response import Response
from rest_framework.views import APIView


class LogoutView(APIView):
    def post(self, request, format=None):
        logout(request)
        return Response(None)
