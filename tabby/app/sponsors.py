from django.conf import settings
from django.core.cache import cache
from gql import Client, gql
from gql.transport.requests import RequestsHTTPTransport


GQL_ENDPOINT = 'https://api.github.com/graphql'
CACHE_KEY = 'cached-sponsors'


def fetch_sponsor_usernames():
    client = Client(
        transport=RequestsHTTPTransport(
            url=GQL_ENDPOINT,
            use_json=True,
            headers={
                'Authorization': f'Bearer {settings.GITHUB_TOKEN}',
            }
        )
    )

    result = []

    after = None

    while True:
        params = 'first: 1'
        if after:
            params += f', after:"{after}"'

        query = '''
            query {
                user (login: "eugeny") {
                    sponsorshipsAsMaintainer(%s, includePrivate: true) {
                    pageInfo {
                        startCursor
                        hasNextPage
                        endCursor
                    }
                    nodes {
                        createdAt
                            tier {
                                monthlyPriceInDollars
                            }
                            sponsor{
                                ... on User {
                                    login
                                }
                            }
                        }
                    }
                }
            }
        ''' % (params,)

        response = client.execute(gql(query))
        after = response['user']['sponsorshipsAsMaintainer']['pageInfo']['endCursor']
        nodes = response['user']['sponsorshipsAsMaintainer']['nodes']
        if not len(nodes):
            break
        for node in nodes:
            if node['tier']['monthlyPriceInDollars'] >= settings.GITHUB_SPONSORS_MIN_PAYMENT:
                result.append(node['sponsor']['login'])

    return result


def get_sponsor_usernames():
    if not cache.get(CACHE_KEY):
        cache.set(CACHE_KEY, fetch_sponsor_usernames(), timeout=30)
    return cache.get(CACHE_KEY)
