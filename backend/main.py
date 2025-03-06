from app.models.device.os.factory import OSFactory
import socketio
import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.v1.routers import api_router
from socket_manager import sio
from database import startup_event
from contextlib import asynccontextmanager

import multiprocessing


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Initialize database and cleanup tasks"""
    await startup_event()
    yield  # Everything before yield runs on startup, after yield runs on shutdown

# ✅ Initialize FastAPI
app = FastAPI(lifespan=lifespan)

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
    """Start FastAPI + Socket.IO Server"""
    print("🚀 Checking PyTorch device before starting server...")
    device_os = OSFactory()
    device_os.check_pytorch_device()  # ✅ This will work now

    print("🚀 Starting FastAPI with Socket.IO on ws://localhost:8000")


    uvicorn.run(app, host="0.0.0.0", port=8000)


if __name__ == "__main__":
    multiprocessing.freeze_support()  # ✅ Prevents PyInstaller infinite restart issues

    # ✅ Start the server in a separate process
    server_process = multiprocessing.Process(target=run_server)
    server_process.start()
    server_process.join()  # Keeps the process running
