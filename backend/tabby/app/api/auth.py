from django.contrib.auth import authenticate, login, logout
from django.conf import settings
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny, IsAuthenticated

from ..models import User


class LogoutView(APIView):
    """Log out the current user."""

    def post(self, request, format=None):
        logout(request)
        return Response(None)


class LocalLoginView(APIView):
    """
    Login with username/password when LOCAL_AUTH_ENABLED is true.

    This provides a fallback authentication method for self-hosted instances
    that don't want to configure OAuth providers.
    """
    permission_classes = [AllowAny]

    def post(self, request, format=None):
        if not getattr(settings, "LOCAL_AUTH_ENABLED", False):
            return Response(
                {"error": "Local authentication is not enabled. Set LOCAL_AUTH_ENABLED=true to enable."},
                status=status.HTTP_403_FORBIDDEN
            )

        username = request.data.get("username", "").strip()
        password = request.data.get("password", "")

        if not username or not password:
            return Response(
                {"error": "Username and password are required."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Try to authenticate with username or email
        user = authenticate(request, username=username, password=password)

        # If authentication failed and username looks like an email, try email lookup
        if user is None and "@" in username:
            try:
                user_by_email = User.objects.get(email__iexact=username)
                user = authenticate(request, username=user_by_email.username, password=password)
            except User.DoesNotExist:
                pass

        if user is None:
            return Response(
                {"error": "Invalid username or password."},
                status=status.HTTP_401_UNAUTHORIZED
            )

        if not user.is_active:
            return Response(
                {"error": "This account has been disabled."},
                status=status.HTTP_403_FORBIDDEN
            )

        login(request, user)
        return Response({
            "success": True,
            "user": {
                "id": user.id,
                "username": user.username,
                "email": user.email,
            }
        })


class LocalRegisterView(APIView):
    """
    Register a new user with username/password when LOCAL_AUTH_REGISTRATION_ENABLED is true.

    This allows self-registration for self-hosted instances. Can be disabled
    to only allow admin-created accounts.
    """
    permission_classes = [AllowAny]

    def post(self, request, format=None):
        if not getattr(settings, "LOCAL_AUTH_ENABLED", False):
            return Response(
                {"error": "Local authentication is not enabled."},
                status=status.HTTP_403_FORBIDDEN
            )

        if not getattr(settings, "LOCAL_AUTH_REGISTRATION_ENABLED", False):
            return Response(
                {"error": "Self-registration is not enabled. Please contact an administrator."},
                status=status.HTTP_403_FORBIDDEN
            )

        username = request.data.get("username", "").strip()
        email = request.data.get("email", "").strip().lower()
        password = request.data.get("password", "")

        # Validation
        errors = {}

        if not username:
            errors["username"] = "Username is required."
        elif len(username) < 3:
            errors["username"] = "Username must be at least 3 characters."
        elif len(username) > 150:
            errors["username"] = "Username must be at most 150 characters."
        elif User.objects.filter(username__iexact=username).exists():
            errors["username"] = "This username is already taken."

        if not email:
            errors["email"] = "Email is required."
        elif "@" not in email:
            errors["email"] = "Please enter a valid email address."
        elif User.objects.filter(email__iexact=email).exists():
            errors["email"] = "This email is already registered."

        if not password:
            errors["password"] = "Password is required."
        elif len(password) < 8:
            errors["password"] = "Password must be at least 8 characters."

        if errors:
            return Response({"errors": errors}, status=status.HTTP_400_BAD_REQUEST)

        # Create user
        user = User.objects.create_user(
            username=username,
            email=email,
            password=password
        )

        # Log them in
        login(request, user)

        return Response({
            "success": True,
            "user": {
                "id": user.id,
                "username": user.username,
                "email": user.email,
            }
        }, status=status.HTTP_201_CREATED)


class ChangePasswordView(APIView):
    """Change password for the currently logged in user."""
    permission_classes = [IsAuthenticated]

    def post(self, request, format=None):
        current_password = request.data.get("current_password", "")
        new_password = request.data.get("new_password", "")

        if not current_password or not new_password:
            return Response(
                {"error": "Current password and new password are required."},
                status=status.HTTP_400_BAD_REQUEST
            )

        if len(new_password) < 8:
            return Response(
                {"error": "New password must be at least 8 characters."},
                status=status.HTTP_400_BAD_REQUEST
            )

        user = request.user

        if not user.check_password(current_password):
            return Response(
                {"error": "Current password is incorrect."},
                status=status.HTTP_401_UNAUTHORIZED
            )

        user.set_password(new_password)
        user.save()

        # Re-login to update session
        login(request, user)

        return Response({"success": True})


class AuthStatusView(APIView):
    """
    Get current authentication status and available auth methods.

    This helps the frontend know which login options to display.
    """
    permission_classes = [AllowAny]

    def get(self, request, format=None):
        # Get configured OAuth providers
        providers = []

        if getattr(settings, "SOCIAL_AUTH_GITHUB_KEY", None):
            providers.append({
                "id": "github",
                "name": "GitHub",
                "url": "/api/1/auth/social/login/github/"
            })

        if getattr(settings, "SOCIAL_AUTH_GITLAB_KEY", None):
            providers.append({
                "id": "gitlab",
                "name": "GitLab",
                "url": "/api/1/auth/social/login/gitlab/"
            })

        if getattr(settings, "SOCIAL_AUTH_GOOGLE_OAUTH2_KEY", None):
            providers.append({
                "id": "google",
                "name": "Google",
                "url": "/api/1/auth/social/login/google-oauth2/"
            })

        if getattr(settings, "SOCIAL_AUTH_MICROSOFT_GRAPH_KEY", None):
            providers.append({
                "id": "microsoft",
                "name": "Microsoft",
                "url": "/api/1/auth/social/login/microsoft-graph/"
            })

        if getattr(settings, "SOCIAL_AUTH_AZUREAD_TENANT_OAUTH2_KEY", None):
            providers.append({
                "id": "azuread",
                "name": "Azure AD",
                "url": "/api/1/auth/social/login/azuread-tenant-oauth2/"
            })

        if getattr(settings, "SOCIAL_AUTH_AUTH0_KEY", None):
            providers.append({
                "id": "auth0",
                "name": "Auth0",
                "url": "/api/1/auth/social/login/auth0/"
            })

        # Check for generic OIDC
        if getattr(settings, "SOCIAL_AUTH_OIDC_KEY", None):
            oidc_name = getattr(settings, "SOCIAL_AUTH_OIDC_DISPLAY_NAME", "OIDC")
            providers.append({
                "id": "oidc",
                "name": oidc_name,
                "url": "/api/1/auth/social/login/oidc/"
            })

        return Response({
            "authenticated": request.user.is_authenticated,
            "user": {
                "id": request.user.id,
                "username": request.user.username,
                "email": request.user.email,
            } if request.user.is_authenticated else None,
            "local_auth_enabled": getattr(settings, "LOCAL_AUTH_ENABLED", False),
            "local_registration_enabled": getattr(settings, "LOCAL_AUTH_REGISTRATION_ENABLED", False),
            "proxy_auth_enabled": getattr(settings, "PROXY_AUTH_ENABLED", False),
            "oauth_providers": providers,
        })
