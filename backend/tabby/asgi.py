import django
import os

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'tabby.settings')
django.setup()

from channels.routing import ProtocolTypeRouter
from django.core.asgi import get_asgi_application

application = ProtocolTypeRouter({
    'http': get_asgi_application(),
})
