import logging
from tabby.app.models import User
from django.conf import settings
from django.contrib.auth import login
from pyga.requests import Tracker, Page, Session, Visitor


class BaseMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response


class TokenMiddleware(BaseMiddleware):
    def __call__(self, request):
        token_value = None
        if 'auth_token' in request.GET:
            token_value = request.GET['auth_token']
        if request.META.get('HTTP_AUTHORIZATION'):
            token_type, *credentials = request.META['HTTP_AUTHORIZATION'].split()
            if token_type == 'Bearer' and len(credentials):
                token_value = credentials[0]

        user = User.objects.filter(config_sync_token=token_value).first()

        if user:
            request.session.save = lambda *args, **kwargs: None
            setattr(user, 'backend', 'django.contrib.auth.backends.ModelBackend')
            login(request, user)
            setattr(request, '_dont_enforce_csrf_checks', True)

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
        if settings.GA_ID and request.path in ['/', '/app']:
            try:
                self.tracker.track_pageview(Page(request.path), Session(), Visitor())
            except Exception:
                logging.exception()

        return response
