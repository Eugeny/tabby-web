from django.db import models
from django.contrib.auth.models import AbstractUser
from django.contrib.auth.signals import user_logged_in
from django.dispatch import receiver


class Config(models.Model):
    user = models.ForeignKey('app.User', related_name='configs', on_delete=models.CASCADE)
    content = models.TextField(default='{}')
    last_used_with_version = models.CharField(max_length=32, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    modified_at = models.DateTimeField(auto_now=True)


class User(AbstractUser):
    active_config = models.ForeignKey(Config, null=True, on_delete=models.CASCADE, related_name='+')
    active_version = models.CharField(max_length=32, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    modified_at = models.DateTimeField(auto_now=True)


# @receiver
