from django.conf import settings
from django.contrib.auth import logout
from rest_framework.response import Response
from rest_framework.views import APIView


# Provider configuration: maps backend names to their display info
# and the environment variable prefix used to detect if they're configured
PROVIDER_CONFIG = {
    'github': {
        'name': 'GitHub',
        'icon': 'github',
        'cls': 'btn-primary',
        'env_prefix': 'SOCIAL_AUTH_GITHUB',
    },
    'gitlab': {
        'name': 'GitLab',
        'icon': 'gitlab',
        'cls': 'btn-warning',
        'env_prefix': 'SOCIAL_AUTH_GITLAB',
    },
    'google-oauth2': {
        'name': 'Google',
        'icon': 'google',
        'cls': 'btn-secondary',
        'env_prefix': 'SOCIAL_AUTH_GOOGLE_OAUTH2',
    },
    'microsoft-graph': {
        'name': 'Microsoft',
        'icon': 'microsoft',
        'cls': 'btn-light',
        'env_prefix': 'SOCIAL_AUTH_MICROSOFT_GRAPH',
    },
    'azuread-tenant-oauth2': {
        'name': 'Azure AD',
        'icon': 'microsoft',
        'cls': 'btn-light',
        'env_prefix': 'SOCIAL_AUTH_AZUREAD_TENANT_OAUTH2',
    },
    'auth0': {
        'name': 'Auth0',
        'icon': 'key',  # Using key icon as Auth0 doesn't have a FA brand icon
        'cls': 'btn-dark',
        'env_prefix': 'SOCIAL_AUTH_AUTH0',
    },
    'oidc': {
        'name': 'SSO',  # Generic name, can be overridden via SOCIAL_AUTH_OIDC_NAME
        'icon': 'openid',  # OpenID icon
        'cls': 'btn-info',
        'env_prefix': 'SOCIAL_AUTH_OIDC',
    },
}


def is_provider_configured(env_prefix: str) -> bool:
    """Check if a provider has both KEY and SECRET configured."""
    key = getattr(settings, f'{env_prefix}_KEY', None)
    secret = getattr(settings, f'{env_prefix}_SECRET', None)
    # For Auth0, also need DOMAIN
    if env_prefix == 'SOCIAL_AUTH_AUTH0':
        domain = getattr(settings, f'{env_prefix}_DOMAIN', None)
        return bool(key and secret and domain)
    # For generic OIDC, also need OIDC_ENDPOINT
    if env_prefix == 'SOCIAL_AUTH_OIDC':
        endpoint = getattr(settings, f'{env_prefix}_OIDC_ENDPOINT', None)
        return bool(key and secret and endpoint)
    # For Azure AD Tenant (single-tenant), also need TENANT_ID
    if env_prefix == 'SOCIAL_AUTH_AZUREAD_TENANT_OAUTH2':
        tenant_id = getattr(settings, f'{env_prefix}_TENANT_ID', None)
        return bool(key and secret and tenant_id)
    return bool(key and secret)


def get_provider_display_name(env_prefix: str, default_name: str) -> str:
    """Get custom display name for a provider, if configured."""
    custom_name = getattr(settings, f'{env_prefix}_NAME', None)
    return custom_name if custom_name else default_name


class LogoutView(APIView):
    def post(self, request, format=None):
        logout(request)
        return Response(None)


class ProvidersView(APIView):
    """Returns list of configured authentication providers."""

    def get(self, request, format=None):
        providers = []
        for provider_id, config in PROVIDER_CONFIG.items():
            if is_provider_configured(config['env_prefix']):
                providers.append({
                    'id': provider_id,
                    'name': get_provider_display_name(
                        config['env_prefix'], config['name']
                    ),
                    'icon': config['icon'],
                    'cls': config['cls'],
                })
        return Response(providers)
