import asyncio
import random
from rest_framework import fields, status
from rest_framework.exceptions import APIException, NotFound
from rest_framework.mixins import RetrieveModelMixin
from rest_framework.viewsets import GenericViewSet
from rest_framework.serializers import ModelSerializer
from ..gateway import GatewayAdminConnection
from ..models import Gateway


class GatewaySerializer(ModelSerializer):
    url = fields.SerializerMethodField()
    auth_token = fields.CharField()

    class Meta:
        fields = '__all__'
        model = Gateway

    def get_url(self, gw):
        return f'{"wss" if gw.secure else "ws"}://{gw.host}:{gw.port}/'


class NoGatewaysError(APIException):
    status_code = status.HTTP_503_SERVICE_UNAVAILABLE
    default_detail = 'No connection gateways available.'
    default_code = 'no_gateways'


class ChooseGatewayViewSet(RetrieveModelMixin, GenericViewSet):
    queryset = Gateway.objects.filter(enabled=True)
    serializer_class = GatewaySerializer

    async def _authorize_client(self, gw):
        c = GatewayAdminConnection(gw)
        await c.connect()
        token = await c.authorize_client()
        await c.close()
        return token

    def get_object(self):
        gateways = list(self.queryset)
        random.shuffle(gateways)
        if not len(gateways):
            raise NotFound()

        loop = asyncio.new_event_loop()
        try:
            for gw in gateways:
                try:
                    gw.auth_token = loop.run_until_complete(self._authorize_client(gw))
                except ConnectionError as e:
                    print(e)
                    continue
                return gw

            raise NoGatewaysError()
        finally:
            loop.close()
