from huggingface_hub import snapshot_download, HfApi
from app.models.schemas.model import DownloadModelRequest, DownloadModelResponse, ModelSizeRequest, ModelSizeResponse
from app.core.dependencies import get_db
from typing import List, Dict
from fastapi import WebSocket, HTTPException
import os
import asyncio
import socketio
from tqdm import tqdm
import time

progress_status: Dict[str, float] = {}
# Create a Socket.IO server


MODEL_DIR = "models"

# Initialize the API
api = HfApi()

def Download_Model_Huggingface(request: DownloadModelRequest):
    try:
        model_id = request.model_id  # Extract model_id here
        model_path = snapshot_download(model_id)
        print(f"Model downloaded at: {model_path}")
        return DownloadModelResponse(message="Download started", model_path=f"models/{request.model_id}")
    except Exception as e:
        return DownloadModelResponse(message=str(e), model_path="None")


async def Download_Model_With_Progress(model_id: str, sid: str):
        """Download model with progress updates via Socket.IO."""
        model_path = os.path.join(MODEL_DIR, model_id)
        sio = socketio.AsyncServer(cors_allowed_origins="*")
        try:
            if not os.path.exists(model_path):
                def progress_callback(bytes_downloaded, bytes_total):
                    """Send progress updates through Socket.IO."""
                    progress = (bytes_downloaded / bytes_total) * 100
                    asyncio.create_task(sio.emit("download_progress", {"model_id": model_id, "progress": progress}, to=sid))

                snapshot_download(repo_id=model_id, local_dir=model_path, progress_callback=progress_callback)

            await sio.emit("download_complete", {"model_id": model_id, "message": "Download completed!"}, to=sid)
        except Exception as e:
            await sio.emit("download_error", {"model_id": model_id, "error": str(e)}, to=sid)


# Async function to handle the download in the background
# 🔹 Function to handle the actual model download (Runs in a separate thread)
# 🔹 Synchronous function to handle download & progress
# 🔹 Function to track download progress manually
# Track file download progress manually
def track_download_progress(model_path, total_size):
    downloaded_size = sum(
        os.path.getsize(os.path.join(dirpath, filename))
        for dirpath, _, filenames in os.walk(model_path)
        for filename in filenames
    )
    return (downloaded_size / total_size) * 100 if total_size else 0
# 🔹 Synchronous function to handle snapshot_download
# Run blocking task in executor
def download_with_progress(model_id, model_path, sid, sio, loop):
    try:
        # Emit start event
        asyncio.run_coroutine_threadsafe(
            sio.emit("status", {"model_id": model_id, "status": "Initializing download"}, to=sid),
            loop,
        )

        # Start the download
        final_path = snapshot_download(repo_id=model_id, local_dir=model_path, resume_download=True)

        # Get total file size after download starts
        total_size = sum(
            os.path.getsize(os.path.join(dirpath, filename))
            for dirpath, _, filenames in os.walk(final_path)
            for filename in filenames
        )

        # Track progress manually
        while True:
            progress = track_download_progress(final_path, total_size)
            asyncio.run_coroutine_threadsafe(
                sio.emit("progress", {"model_id": model_id, "progress": round(progress, 2)}, to=sid),
                loop,
            )
            if progress >= 100:
                break
            time.sleep(1)  # Check progress every 1 second

        # Emit completion event
        asyncio.run_coroutine_threadsafe(
            sio.emit("completed", {"model_id": model_id, "model_path": final_path}, to=sid),
            loop,
        )

        return final_path
    except Exception as e:
        asyncio.run_coroutine_threadsafe(
            sio.emit("error", {"model_id": model_id, "error": str(e)}, to=sid),
            loop,
        )


# 🔹 Background task to run snapshot_download in a separate thread
async def download_model_in_background(sid, model_id, model_path, sio):
    try:
        os.makedirs(model_path, exist_ok=True)
        await sio.emit("status", {"model_id": model_id, "status": "Starting download"}, to=sid)

        loop = asyncio.get_event_loop()
        
        # Pass `loop` as an argument to ensure coroutines run properly
        final_path = await loop.run_in_executor(
            None, download_with_progress, model_id, model_path, sid, sio, loop
        )

        await sio.emit("status", {"model_id": model_id, "status": f"Download complete, saved at {final_path}"}, to=sid)
        return final_path

    except Exception as e:
        await sio.emit("error", {"model_id": model_id, "error": str(e)}, to=sid)



async def model_size(body: ModelSizeRequest)-> ModelSizeResponse:
    """Get additional files for a model."""
    # Initialize total size counter
    total_size = 0
    try:

        if not body.model_id:
            raise HTTPException(status_code=400, detail="Model ID is required.")
       # Fetch model information
        model_info = api.model_info(repo_id=body.model_id)

      

        # Iterate through the model's files
        for file in model_info.siblings:
            # Check if the file size is available
            if file.size:
                total_size += file.size

        # Convert the total size to megabytes (MB)
        total_size = total_size / (1024 * 1024)
        return DownloadModelResponse(size = total_size)
    except Exception as e:
        raise DownloadModelResponse(size = 0)

