from django.conf import settings
from django.core.cache import cache
from gql import Client, gql
from gql.transport.requests import RequestsHTTPTransport
from social_django.models import UserSocialAuth

from .models import User


GQL_ENDPOINT = 'https://api.github.com/graphql'
CACHE_KEY = 'cached-sponsors:%s'


def check_is_sponsor(user: User) -> bool:
    try:
        token = user.social_auth.get(provider='github').extra_data.get('access_token')
    except UserSocialAuth.DoesNotExist:
        return False

    if not token:
        return False

    client = Client(
        transport=RequestsHTTPTransport(
            url=GQL_ENDPOINT,
            use_json=True,
            headers={
                'Authorization': f'Bearer {token}',
            }
        )
    )

    after = None

    while True:
        params = 'first: 1'
        if after:
            params += f', after:"{after}"'

        query = '''
            query {
                viewer {
                    sponsorshipsAsSponsor(%s) {
                        pageInfo {
                            startCursor
                            hasNextPage
                            endCursor
                        }
                        totalRecurringMonthlyPriceInDollars
                        nodes {
                            sponsorable {
                                ... on Organization { login }
                                ... on User { login }
                            }
                        }
                    }
                }
            }
        ''' % (params,)

        response = client.execute(gql(query))
        info = response['viewer']['sponsorshipsAsSponsor']
        after = info['pageInfo']['endCursor']
        nodes = info['nodes']
        if not len(nodes):
            break
        for node in nodes:
            if node['sponsorable']['login'].lower() not in settings.GITHUB_ELIGIBLE_SPONSORSHIPS:
                continue
            if info['totalRecurringMonthlyPriceInDollars'] >= settings.GITHUB_SPONSORS_MIN_PAYMENT:
                return True

    return False


def check_is_sponsor_cached(user: User) -> bool:
    cache_key = CACHE_KEY % user.id
    if not cache.get(cache_key):
        cache.set(cache_key, check_is_sponsor(user), timeout=30)
    return cache.get(cache_key)
