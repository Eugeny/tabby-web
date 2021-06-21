from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User, Config

class CustomUserAdmin(UserAdmin):
    fieldsets = UserAdmin.fieldsets + (
        (None, {'fields': ('custom_connection_gateway', 'custom_connection_gateway_token')}),
    )

admin.site.register(User, CustomUserAdmin)
admin.site.register(Config)
