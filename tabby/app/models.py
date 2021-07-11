from django.db import models
from django.contrib.auth.models import AbstractUser
from django.contrib.auth.signals import user_logged_in
from django.dispatch import receiver
from django.db.models.signals import post_save


class Config(models.Model):
    user = models.ForeignKey('app.User', related_name='configs', on_delete=models.CASCADE)
    content = models.TextField(default='{}')
    last_used_with_version = models.CharField(max_length=32, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    modified_at = models.DateTimeField(auto_now=True)


class User(AbstractUser):
    active_config = models.ForeignKey(Config, null=True, on_delete=models.CASCADE, related_name='+')
    active_version = models.CharField(max_length=32, null=True)
    custom_connection_gateway = models.CharField(max_length=255, null=True)
    custom_connection_gateway_token = models.CharField(max_length=255, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    modified_at = models.DateTimeField(auto_now=True)


class Gateway(models.Model):
    host = models.CharField(max_length=255)
    port = models.IntegerField(default=1234)
    enabled = models.BooleanField(default=True)
    secure = models.BooleanField(default=True)

    def __str__(self):
        return f'{self.host}:{self.port}'
