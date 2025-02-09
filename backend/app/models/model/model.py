from sqlalchemy.future import select
from huggingface_hub import snapshot_download, HfApi, list_repo_files
from app.models.schemas.model import DownloadModelRequest, DownloadModelResponse, ModelSizeRequest, ModelSizeResponse, ModelSizeCalculate
from app.core.dependencies import get_db
from typing import List, Dict
from fastapi import WebSocket, HTTPException
import os
import asyncio
from tqdm import tqdm
import time
import requests
from bs4 import BeautifulSoup
from database import async_session_maker  # Import async session maker
from app.models.models import Model, Setting
from sqlalchemy.exc import SQLAlchemyError  # Import to catch DB errors
from sqlalchemy.ext.asyncio import AsyncSession

progress_status: Dict[str, float] = {}
# Create a Socket.IO server
db: AsyncSession = AsyncSession()


# Creates a "models" folder inside Downloads
MODEL_DIR = os.path.expanduser("~/Downloads/models")

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
    print(f"Downloading model {model_id} to {model_path}")
    sio = socketio.AsyncServer(cors_allowed_origins="*")

    try:
        if not os.path.exists(model_path):
            def progress_callback(bytes_downloaded: int, bytes_total: int):
                """Send progress updates through Socket.IO."""
                progress = (bytes_downloaded / bytes_total) * 100
                asyncio.create_task(
                    sio.emit("progress", {"model_id": model_id, "progress": progress}, to=sid))

            # Download the model with progress callback
            snapshot_download(
                repo_id=model_id,
                local_dir=model_path,
                progress_callback=progress_callback
            )

        # Notify the client that the download is complete
        await sio.emit("download_complete", {"model_id": model_id, "message": "Download completed!"}, to=sid)
    except Exception as e:
        # Notify the client of any errors
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


async def get_download_path():
    """Fetch the model download path from the database."""
    async with async_session_maker() as db:
        result = await db.execute(select(Setting))
        setting = result.scalars().first()
        if setting and setting.path_store_name_main:
            return setting.path_store_name_main
        return None  # Handle missing path gracefully


async def get_model_size_from_huggingface(model_id):
    """Fetch the estimated model size from Hugging Face Hub."""
    try:
        api = HfApi()
        model_info = api.model_info(model_id)
        return model_info.disk_size  # Returns size in bytes
    except Exception:
        return None  # If API call fails, fallback to dynamic estimation


async def get_folder_size(folder_path):
    """Get the total size of a folder (all files inside it)."""
    return sum(
        os.path.getsize(os.path.join(dirpath, filename))
        for dirpath, _, filenames in os.walk(folder_path)
        for filename in filenames
    )


async def download_with_progress(model_id, sid, sio, loop):
    try:
        print("Starting download process...")

        # Fetch the download path from the database
        download_path = await get_download_path()

        if not download_path:
            raise ValueError("Download path is not set in the database")

        # Model-specific directory
        model_path = os.path.join(download_path, model_id)
        os.makedirs(model_path, exist_ok=True)  # Ensure path exists

        # Emit initialization event
        await sio.emit("status", {"model_id": model_id, "status": "Initializing download"}, to=sid)

        # Get estimated total size of model (optional: use Hugging Face API)
        expected_size = None  # No API call here, we calculate dynamically

        # Start snapshot_download in a separate thread
        final_path = snapshot_download(
            repo_id=model_id, local_dir=model_path, resume_download=True)

        # Emit completion event
        await sio.emit("completed", {"model_id": model_id, "model_path": final_path}, to=sid)

        return final_path

    except Exception as e:
        await sio.emit("error", {"model_id": model_id, "error": str(e)}, to=sid)


# 🔹 Background task to run snapshot_download in a separate thread


async def download_model_in_background(sid, model_id, sio):
    try:
        await sio.emit("status", {"model_id": model_id, "status": "Starting download"}, to=sid)
        print("Starting download process...")

        # Use `asyncio.create_task()` to start the async function properly
        final_path = await download_with_progress(model_id, sid, sio, asyncio.get_event_loop())

        # Calculate model size
        # Function to calculate total size
        total_size = await get_folder_size(final_path)
        size_mb = round(total_size / (1024 * 1024), 2)  # Convert bytes to MB

        # Save details to database
        async with async_session_maker() as db:

            # Check if model exists
            result = await db.execute(select(Model).where(Model.model_id == model_id))
            existing_model = result.scalars().first()

            if existing_model:
                # Update existing model
                existing_model.path = final_path
                existing_model.size = size_mb
            else:
                # Insert new model entry
                new_model = Model(
                    model_id=model_id,
                    model_name=model_id,  # You can change this if you have a proper name
                    path=final_path,
                    size=size_mb,
                    unit="MB"
                )
                db.add(new_model)

            await db.commit()
        print("final_path-->", final_path)

        await sio.emit("status", {"model_id": model_id, "status": f"Download complete, saved at {final_path}"}, to=sid)
        return final_path

    except Exception as e:
        await sio.emit("error", {"model_id": model_id, "error": str(e)}, to=sid)


def get_model_size(model_name: str) -> ModelSizeResponse:
    """Fetch the total size of a model from Hugging Face API using the `usedStorage` field.

    Args:
        model_name (str): The name of the model repository (e.g., "deepseek-ai/DeepSeek-R1").

    Returns:
        float: The total size of the model in MB.
    """
    # Fetch model information from Hugging Face API
    api_url = f"https://huggingface.co/api/models/{model_name}"
    response = requests.get(api_url)
    data = response.json()

    # Extract the usedStorage field (in bytes)
    used_storage_bytes = data.get("usedStorage", 0)

    used_storage_mb = round(used_storage_bytes / (1024 ** 2), 2)
    used_storage_gb = round(used_storage_bytes / (1024 ** 3), 2)

    if used_storage_gb >= 1:
        return ModelSizeResponse(size=used_storage_gb, unit='GB')
    else:
        return ModelSizeResponse(size=used_storage_mb, unit='MB')


async def model_size(body: ModelSizeRequest) -> ModelSizeResponse:
    """Get additional files for a model."""
    total_size = 0
    try:
        if not body.model_id:
            raise HTTPException(
                status_code=400, detail="Model ID is required.")

        size = get_model_size(body.model_id)

        # Ensure model_path is included
        return ModelSizeResponse(size=size.size, unit=size.unit)

    except Exception as e:
        print(str(e))
        return ModelSizeResponse(size=0, unit='')


def get_model_size_from_tree(model_name):
    url = f"https://huggingface.co/{model_name}/tree/main"
    response = requests.get(url)

    if response.status_code != 200:
        print(f"Error: Unable to access model page for {model_name}")
        return None

    soup = BeautifulSoup(response.text, "html.parser")

    total_size = 0
    for file_entry in soup.find_all("span", class_="truncate"):
        size_span = file_entry.find_next(
            "span", class_="text-gray-500 text-sm")
        if size_span:
            size_text = size_span.text.strip()
            size_mb = convert_size_to_mb(size_text)
            if size_mb:
                total_size += size_mb

    print(f"Estimated Model Size for {model_name}: {total_size:.2f} MB")
    return total_size


def convert_size_to_mb(size_text):
    """ Convert size like '2.3 GB' or '512 KB' to MB """
    try:
        value, unit = size_text.split()
        value = float(value)
        if "GB" in unit:
            return value * 1024
        elif "MB" in unit:
            return value
        elif "KB" in unit:
            return value / 1024
        return None
    except:
        return None


async def Get_Model_Downloaded():
    """Get all saved model details."""
    async with async_session_maker() as db:  # ✅ Ensure it's an instance, not a callable
        try:
            result = await db.execute(select(Model))
            models = result.scalars().all()

            return {"success": True, "models": [
                {
                    "model_id": model.model_id,
                    "model_name": model.model_name,
                    "path": model.path,
                    "size": model.size,
                    "unit": model.unit,
                } for model in models
            ]}

        except SQLAlchemyError as e:
            await db.rollback()
            print(f"Database error: {e}")
            return {"error": "Database error occurred"}

        except Exception as e:
            await db.rollback()
            print(f"Unexpected error: {e}")
            return {"error": str(e)}
