import asyncio
from channels.generic.websocket import AsyncWebsocketConsumer


class TCPConsumer(AsyncWebsocketConsumer):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.loop = asyncio.get_event_loop()

    async def connect(self):
        self.reader, self.writer = await asyncio.open_connection('192.168.78.233', 22)
        self._socket_reader = self.loop.create_task(self.socket_reader())
        await self.accept()

    async def disconnect(self, close_code):
        await self.writer.drain()
        self.writer.close()
        await self._socket_reader

    async def receive(self, bytes_data):
        self.writer.write(bytes_data)

    async def socket_reader(self):
        while True:
            await self.reader._wait_for_data('read')
            data = bytes(self.reader._buffer.copy())
            if not data:
                await self.close()
                return
            del self.reader._buffer[:]
            await self.send(bytes_data=data)
