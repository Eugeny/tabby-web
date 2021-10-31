import secrets
from datetime import date
from django.db import models
from django.contrib.auth.models import AbstractUser


class Config(models.Model):
    user = models.ForeignKey('app.User', related_name='configs', on_delete=models.CASCADE)
    name = models.CharField(max_length=255)
    content = models.TextField(default='{}')
    last_used_with_version = models.CharField(max_length=32, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    modified_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        if not self.name:
            self.name = f'Unnamed config ({date.today()})'
        super().save(*args, **kwargs)


class User(AbstractUser):
    active_config = models.ForeignKey(Config, null=True, on_delete=models.SET_NULL, related_name='+')
    active_version = models.CharField(max_length=32, null=True)
    custom_connection_gateway = models.CharField(max_length=255, null=True, blank=True)
    custom_connection_gateway_token = models.CharField(max_length=255, null=True, blank=True)
    config_sync_token = models.CharField(max_length=255)
    force_pro = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    modified_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        if not self.config_sync_token:
            self.config_sync_token = secrets.token_hex(64)
        super().save(*args, **kwargs)


class Gateway(models.Model):
    host = models.CharField(max_length=255)
    port = models.IntegerField(default=1234)
    admin_port = models.IntegerField(default=1235)
    enabled = models.BooleanField(default=True)
    secure = models.BooleanField(default=True)

    def __str__(self):
        return f'{self.host}:{self.port}'
