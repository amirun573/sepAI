

from app.models.model.model import download_model_in_background
import socketio
import asyncio

sio = socketio.AsyncServer(cors_allowed_origins="*", async_mode="asgi")

@sio.event
async def connect(sid, environ):
    print(f"✅ Client {sid} connected.")

@sio.event
async def disconnect(sid):
    print(f"❌ Client {sid} disconnected.")

@sio.event
async def start_download(sid, data):
    model_id = data.get("model_id")
    model_path = f"models/{model_id}"  # 🔹 Ensure the model directory exists

    print(f"📥 Starting download for {model_id}")
    asyncio.create_task(download_model_in_background(sid, model_id, model_path, sio))
