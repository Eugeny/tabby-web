import os
from dotenv import load_dotenv
from pathlib import Path

load_dotenv()

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent


# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/3.2/howto/deployment/checklist/

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = 'django-insecure-jw3fshufj(1$iv+&9bie=r%27+^e2sz0!_gq38*5p5!csrm&#s'

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = True

ALLOWED_HOSTS = ['*']


# Application definition

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'channels',
    'rest_framework',
    'social_django',
    'terminus.app',
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'terminus.urls'

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

ASGI_APPLICATION = 'terminus.asgi.application'
WSGI_APPLICATION = 'terminus.wsgi.application'


# Database
# https://docs.djangoproject.com/en/3.2/ref/settings/#databases

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}


# Password validation
# https://docs.djangoproject.com/en/3.2/ref/settings/#auth-password-validators

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


# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/3.2/howto/static-files/

STATIC_URL = '/static/'

# Default primary key field type
# https://docs.djangoproject.com/en/3.2/ref/settings/#default-auto-field

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

LOGIN_REDIRECT_URL = '/'

APP_DIST_PATH = BASE_DIR / 'app-dist'

for key in [
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
    'GITHUB_SPONSORS_USER',
    'GITHUB_SPONSORS_MIN_PAYMENT',
    'GITHUB_TOKEN',
]:
    globals()[key] = os.getenv(key)


for key in [
    'GITHUB_SPONSORS_MIN_PAYMENT',
]:
    globals()[key] = int(globals()[key]) if globals()[key] else None


for key in [
    'CONNECTION_GATEWAY_AUTH_CA',
    'CONNECTION_GATEWAY_AUTH_CERTIFICATE',
    'CONNECTION_GATEWAY_AUTH_KEY',
]:
    v = globals()[key]
    if v and not os.path.exists(v):
        raise ValueError(f'{v} does not exist')
