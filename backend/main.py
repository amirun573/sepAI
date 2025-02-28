import asyncio
import socketio
import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from huggingface_hub import snapshot_download
from app.api.v1.routers import api_router
from socket_manager import sio
import multiprocessing

# ✅ Initialize FastAPI
app = FastAPI()

# ✅ Allow CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix="/api/v1")

# ✅ Mount FastAPI with Socket.IO
app = socketio.ASGIApp(sio, other_asgi_app=app)

def run_server():
    print("🚀 Starting FastAPI with Socket.IO on ws://localhost:8000")
    uvicorn.run(app, host="0.0.0.0", port=8000)

if __name__ == "__main__":
    # Use multiprocessing to avoid PyInstaller restart issue
    # multiprocessing.freeze_support()
    run_server()