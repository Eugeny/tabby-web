from django.core.cache import cache

from .models import User

CACHE_KEY = "cached-sponsors:%s"


def check_is_sponsor(_: User) -> bool:
    return False


def check_is_sponsor_cached(user: User) -> bool:
    cache_key = CACHE_KEY % user.id
    if not cache.get(cache_key):
        cache.set(cache_key, check_is_sponsor(user), timeout=30)
    return cache.get(cache_key)
