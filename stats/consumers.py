from channels.generic.websocket import AsyncJsonWebsocketConsumer
import json

class DashboardConsumer(AsyncJsonWebsocketConsumer):

    async def connect(self):
        print('connection')
        await self.accept
        
    
    async def disconnect(self, close_code):
        print(f'connection closed with code: {close_code}')pass
    
    async def receive(self, text_data):
        text_data_json = json.loads(text_data)
        message = text_data_json["message"]
        sender = text_data_json["sender"]

        print(message, sender)

        await self.send(text_data=json.dumps({
            'message': message,
            'sender': sender
        }))