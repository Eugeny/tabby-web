import logging
from django.conf import settings
from pyga.requests import Tracker, Page, Session, Visitor


class GAMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response
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
