from django.contrib.auth import logout, login, authenticate
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import status

from ..models import User
from .user import UserSerializer


class LoginView(APIView):
    def post(self, request, format=None):
        username = request.data.get("username")
        password = request.data.get("password")
        user = authenticate(request, username=username, password=password)
        if user is not None:
            login(request, user)
            serializer = UserSerializer(user)
            return Response(serializer.data)
        else:
            return Response(
                {"error": "Invalid credentials"}, status=status.HTTP_400_BAD_REQUEST
            )


class LogoutView(APIView):
    def post(self, request, format=None):
        logout(request)
        return Response(None)
