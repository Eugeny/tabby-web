import logging
from tabby.app.models import User
from django.conf import settings
from django.contrib.auth import login
from pyga.requests import Tracker, Page, Session, Visitor


class BaseMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response


class ProxyAuthMiddleware(BaseMiddleware):
    """
    Middleware to authenticate users via auth proxy headers.

    When running behind an authenticating proxy (like Authentik, Authelia,
    or any ForwardAuth service), this middleware trusts the X-Auth-* headers
    set by the proxy and automatically logs in users based on their email.

    Headers:
        X-Auth-User-Email: User's email address (required for auth)
        X-Auth-User-Name: User's display name (optional)
        X-Auth-User-Id: External user ID (optional)
        X-Auth-Tenant-Id: Tenant ID (optional)

    Enable by setting PROXY_AUTH_ENABLED=true in environment.
    """

    def __call__(self, request):
        # Only process if proxy auth is enabled
        if not getattr(settings, "PROXY_AUTH_ENABLED", False):
            return self.get_response(request)

        # Skip if user is already authenticated
        if request.user.is_authenticated:
            return self.get_response(request)

        # Check for proxy auth header (Django converts X-Auth-User-Email to HTTP_X_AUTH_USER_EMAIL)
        user_email = request.META.get("HTTP_X_AUTH_USER_EMAIL")
        if not user_email:
            return self.get_response(request)

        # Get optional headers
        user_name = request.META.get("HTTP_X_AUTH_USER_NAME", "")
        tenant_id = request.META.get("HTTP_X_AUTH_TENANT_ID", "")

        # Get or create user by email
        user, created = User.objects.get_or_create(
            email=user_email,
            defaults={
                "username": self._generate_username(user_email, user_name),
                "first_name": user_name.split()[0] if user_name else "",
                "last_name": " ".join(user_name.split()[1:]) if user_name else "",
            }
        )

        if created:
            logging.info(
                f"ProxyAuthMiddleware: Created new user {user.username} "
                f"(email={user_email}, tenant={tenant_id})"
            )
        else:
            # Update name if provided and changed
            if user_name and user.first_name != user_name.split()[0]:
                user.first_name = user_name.split()[0] if user_name else ""
                user.last_name = " ".join(user_name.split()[1:]) if user_name else ""
                user.save(update_fields=["first_name", "last_name"])

        # Log in the user
        setattr(user, "backend", "django.contrib.auth.backends.ModelBackend")
        login(request, user)
        setattr(request, "_dont_enforce_csrf_checks", True)

        # Store tenant info on request for potential future use
        if tenant_id:
            setattr(request, "tenant_id", tenant_id)

        return self.get_response(request)

    def _generate_username(self, email: str, name: str) -> str:
        """Generate a unique username from email or name."""
        # Try name first (without spaces)
        if name:
            base_username = name.replace(" ", "_").lower()[:30]
        else:
            # Use email prefix
            base_username = email.split("@")[0].lower()[:30]

        # Ensure uniqueness
        username = base_username
        counter = 1
        while User.objects.filter(username=username).exists():
            suffix = f"_{counter}"
            username = base_username[: 30 - len(suffix)] + suffix
            counter += 1

        return username


class TokenMiddleware(BaseMiddleware):
    def __call__(self, request):
        token_value = None
        if "auth_token" in request.GET:
            token_value = request.GET["auth_token"]
        if request.META.get("HTTP_AUTHORIZATION"):
            token_type, *credentials = request.META["HTTP_AUTHORIZATION"].split()
            if token_type == "Bearer" and len(credentials):
                token_value = credentials[0]

        user = User.objects.filter(config_sync_token=token_value).first()

        if user:
            request.session.save = lambda *args, **kwargs: None
            setattr(user, "backend", "django.contrib.auth.backends.ModelBackend")
            login(request, user)
            setattr(request, "_dont_enforce_csrf_checks", True)

        response = self.get_response(request)

        if user:
            response.set_cookie = lambda *args, **kwargs: None

        return response


class GAMiddleware(BaseMiddleware):
    def __init__(self, get_response):
        super().__init__(get_response)
        if settings.GA_ID:
            self.tracker = Tracker(settings.GA_ID, settings.GA_DOMAIN)

    def __call__(self, request):
        response = self.get_response(request)
        if settings.GA_ID and request.path in ["/", "/app"]:
            try:
                self.tracker.track_pageview(Page(request.path), Session(), Visitor())
            except Exception:
                logging.exception()

        return response
