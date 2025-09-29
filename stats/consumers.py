from channels.generic.websocket import AsyncJsonWebsocketConsumer


class DashboardConsumer(AsyncJsonWebsocketConsumer):

    async def connect(self):
        print('connection')
        await self.accept()

    async def disconnect(self, close_code):
        print(f'connection closed with code: {close_code}')

    async def receive_json(self, content):
        message = content["message"]
        sender = content["sender"]

        print(message, sender)

        await self.send_json({
            'message': message,
            'sender': sender
        })