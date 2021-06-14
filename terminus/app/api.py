# from rest_framework import fields
from rest_framework.viewsets import ModelViewSet
from rest_framework.serializers import ModelSerializer

from .models import Config


class ConfigSerializer(ModelSerializer):
    class Meta:
        model = Config
        fields = '__all__'


class ConfigViewSet(ModelViewSet):
    queryset = Config.objects.all()
    serializer_class = ConfigSerializer

    def get_queryset(self):
        return Config.objects.filter(user=self.request.user)
