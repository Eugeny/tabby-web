from rest_framework import fields
from rest_framework.permissions import IsAuthenticated
from rest_framework.viewsets import ModelViewSet
from rest_framework.serializers import ModelSerializer
from ..models import Config


class ConfigSerializer(ModelSerializer):
    name = fields.CharField(required=False)

    class Meta:
        model = Config
        read_only_fields = ("user", "created_at", "modified_at")
        fields = "__all__"


class ConfigViewSet(ModelViewSet):
    queryset = Config.objects.all()
    serializer_class = ConfigSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        if self.request.user.is_authenticated:
            return Config.objects.filter(user=self.request.user)
        return Config.objects.none()

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
