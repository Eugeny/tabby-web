import asyncio
import os
import ssl
import websockets
from channels.generic.websocket import AsyncWebsocketConsumer
from django.conf import settings
from urllib.parse import quote


class GatewayConnection:
    _ssl_context: ssl.SSLContext = None

    def __init__(self, host: str, port: int):
        if settings.CONNECTION_GATEWAY_AUTH_KEY and not GatewayConnection._ssl_context:
            ctx = ssl.create_default_context(purpose=ssl.Purpose.CLIENT_AUTH)
            ctx.load_cert_chain(
                os.path.realpath(settings.CONNECTION_GATEWAY_AUTH_CERTIFICATE),
                os.path.realpath(settings.CONNECTION_GATEWAY_AUTH_KEY),
            )
            if settings.CONNECTION_GATEWAY_AUTH_CA:
                ctx.load_verify_locations(
                    cafile=os.path.realpath(settings.CONNECTION_GATEWAY_AUTH_CA),
                )
                ctx.verify_mode = ssl.CERT_REQUIRED
            GatewayConnection._ssl_context = ctx

        proto = 'wss' if GatewayConnection._ssl_context else 'ws'
        self.url = f'{proto}://localhost:9000/connect/{quote(host)}:{quote(str(port))}'

    async def connect(self):
        self.context = websockets.connect(self.url, ssl=GatewayConnection._ssl_context)
        self.socket = await self.context.__aenter__()

    async def send(self, data):
        await self.socket.send(data)

    def recv(self, timeout=None):
        return asyncio.wait_for(self.socket.recv(), timeout)

    async def close(self):
        await self.socket.close()
        await self.context.__aexit__(None, None, None)


class TCPConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.closed = False
        self.conn = GatewayConnection(
            self.scope['url_route']['kwargs']['host'],
            int(self.scope['url_route']['kwargs']['port']),
        )
        await self.conn.connect()
        await self.accept()
        self.reader = asyncio.get_event_loop().create_task(self.socket_reader())

    async def disconnect(self, close_code):
        self.closed = True
        await self.conn.close()

    async def receive(self, bytes_data):
        await self.conn.send(bytes_data)

    async def socket_reader(self):
        while True:
            if self.closed:
                return
            try:
                data = await self.conn.recv(timeout=10)
            except asyncio.TimeoutError:
                continue
            except websockets.exceptions.ConnectionClosed:
                await self.close()
                return
            await self.send(bytes_data=data)
