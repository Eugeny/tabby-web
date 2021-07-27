import os
import dj_database_url
from dotenv import load_dotenv
from pathlib import Path
from urllib.parse import urlparse

load_dotenv()

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent

FRONTEND_BUILD_DIR = BASE_DIR / '../frontend/build'

# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/3.2/howto/deployment/checklist/

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = 'django-insecure-jw3fshufj(1$iv+&9bie=r%27+^e2sz0!_gq38*5p5!csrm&#s'

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = bool(os.getenv('DEBUG', False))

ALLOWED_HOSTS = ['*']
USE_X_FORWARDED_HOST = True
SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')


# Application definition

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'rest_framework',
    'social_django',
    'corsheaders',
    'tabby.app',
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    'corsheaders.middleware.CorsMiddleware',
    'tabby.middleware.TokenMiddleware',
    'tabby.middleware.GAMiddleware',
]

ROOT_URLCONF = 'tabby.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'tabby.wsgi.application'

DATABASES = {
    'default': dj_database_url.config(conn_max_age=600)
}

CACHES = {
    'default': {
        'BACKEND': 'django.core.cache.backends.locmem.LocMemCache',
    }
}

AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]

AUTH_USER_MODEL = 'app.User'

# Internationalization
# https://docs.djangoproject.com/en/3.2/topics/i18n/

LANGUAGE_CODE = 'en-us'

TIME_ZONE = 'UTC'

USE_I18N = True

USE_L10N = True

USE_TZ = True

LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'simple': {
            'format': '%(levelname)s %(message)s'
        },
    },
    'handlers': {
        'console': {
            'level': 'INFO',
            'class': 'logging.StreamHandler',
            'formatter': 'simple'
        },
    },
    'loggers': {
        '': {
            'handlers': ['console'],
            'propagate': False,
            'level': 'INFO',
        },
    },
}

STATIC_URL = '/static/'
STATICFILES_DIRS = [FRONTEND_BUILD_DIR]

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

CSRF_USE_SESSIONS = False
CSRF_COOKIE_HTTPONLY = False
CSRF_COOKIE_NAME = 'XSRF-TOKEN'
CSRF_HEADER_NAME = 'HTTP_X_XSRF_TOKEN'

AUTHENTICATION_BACKENDS = (
    'social_core.backends.github.GithubOAuth2',
    'social_core.backends.gitlab.GitLabOAuth2',
    'social_core.backends.azuread.AzureADOAuth2',
    'social_core.backends.microsoft.MicrosoftOAuth2',
    'social_core.backends.google.GoogleOAuth2',
    'django.contrib.auth.backends.ModelBackend',
)

SOCIAL_AUTH_GITHUB_SCOPE = ['read:user', 'user:email']
SOCIAL_AUTH_PIPELINE = (
    'social_core.pipeline.social_auth.social_details',
    'social_core.pipeline.social_auth.social_uid',
    'social_core.pipeline.social_auth.auth_allowed',
    'social_core.pipeline.social_auth.social_user',
    'social_core.pipeline.user.get_username',
    'social_core.pipeline.social_auth.associate_by_email',
    'social_core.pipeline.user.create_user',
    'social_core.pipeline.social_auth.associate_user',
    'social_core.pipeline.social_auth.load_extra_data',
    'social_core.pipeline.user.user_details',
)

APP_DIST_STORAGE = os.getenv('APP_DIST_STORAGE', 'file://' + str(BASE_DIR / 'app-dist'))
NPM_REGISTRY = os.getenv('NPM_REGISTRY', 'https://registry.npmjs.org').rstrip('/')

FRONTEND_URL = None
GITHUB_ELIGIBLE_SPONSORSHIPS = None

for key in [
    'FRONTEND_URL',
    'SOCIAL_AUTH_GITHUB_KEY',
    'SOCIAL_AUTH_GITHUB_SECRET',
    'SOCIAL_AUTH_GITLAB_KEY',
    'SOCIAL_AUTH_GITLAB_SECRET',
    'SOCIAL_AUTH_GOOGLE_OAUTH2_KEY',
    'SOCIAL_AUTH_GOOGLE_OAUTH2_SECRET',
    'SOCIAL_AUTH_MICROSOFT_GRAPH_KEY',
    'SOCIAL_AUTH_MICROSOFT_GRAPH_SECRET',
    'CONNECTION_GATEWAY_AUTH_CA',
    'CONNECTION_GATEWAY_AUTH_CERTIFICATE',
    'CONNECTION_GATEWAY_AUTH_KEY',
    'GITHUB_ELIGIBLE_SPONSORSHIPS',
    'GITHUB_SPONSORS_MIN_PAYMENT',
    'ENABLE_LOGIN',
    'GA_ID',
    'GA_DOMAIN',
    'ENABLE_HOMEPAGE',
]:
    globals()[key] = os.getenv(key)


for key in [
    'GITHUB_SPONSORS_MIN_PAYMENT',
]:
    globals()[key] = int(globals()[key]) if globals()[key] else None


for key in [
    'ENABLE_LOGIN',
    'ENABLE_HOMEPAGE',
]:
    globals()[key] = bool(globals()[key]) if globals()[key] else None


for key in [
    'CONNECTION_GATEWAY_AUTH_CA',
    'CONNECTION_GATEWAY_AUTH_CERTIFICATE',
    'CONNECTION_GATEWAY_AUTH_KEY',
]:
    v = globals()[key]
    if v and not os.path.exists(v):
        raise ValueError(f'{v} does not exist')

if GITHUB_ELIGIBLE_SPONSORSHIPS:
    GITHUB_ELIGIBLE_SPONSORSHIPS = GITHUB_ELIGIBLE_SPONSORSHIPS.split(',')
else:
    GITHUB_ELIGIBLE_SPONSORSHIPS = []


if FRONTEND_URL:
    CORS_ALLOWED_ORIGINS = [FRONTEND_URL]
    CORS_ALLOW_CREDENTIALS = True
    CORS_ALLOW_HEADERS = [
        'accept',
        'accept-encoding',
        'authorization',
        'content-type',
        'dnt',
        'origin',
        'user-agent',
        'x-xsrf-token',
        'x-requested-with',
    ]
    frontend_domain = urlparse(FRONTEND_URL).hostname
    CSRF_TRUSTED_ORIGINS = [frontend_domain]
    SESSION_COOKIE_DOMAIN = frontend_domain
    CSRF_COOKIE_DOMAIN = frontend_domain

    FRONTEND_URL = FRONTEND_URL.rstrip('/')

    if FRONTEND_URL.startswith('https://'):
        CSRF_COOKIE_SECURE = True
        SESSION_COOKIE_SECURE = True
else:
    FRONTEND_URL = ''

LOGIN_REDIRECT_URL = FRONTEND_URL + '/app'
