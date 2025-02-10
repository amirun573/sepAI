import json
from sqlalchemy.future import select
from huggingface_hub import snapshot_download, HfApi, list_repo_files, hf_hub_download
from app.models.schemas.model import DownloadModelRequest, DownloadModelResponse, ModelSizeRequest, ModelSizeResponse, ModelSizeCalculate
from app.core.dependencies import get_db
from typing import List, Dict
from fastapi import WebSocket, HTTPException
import os
from transformers import AutoModel, AutoTokenizer
import asyncio
from tqdm import tqdm
import time
import requests
from bs4 import BeautifulSoup
from app.models.setting.setting import Get_Settings
from database import async_session_maker  # Import async session maker
from app.models.models import Model, Setting
from sqlalchemy.exc import SQLAlchemyError  # Import to catch DB errors
from sqlalchemy.ext.asyncio import AsyncSession
import shutil
import functools
import concurrent.futures


progress_status: Dict[str, float] = {}
# Create a Socket.IO server
db: AsyncSession = AsyncSession()
# Store running tasks
running_tasks = {}
executor = concurrent.futures.ThreadPoolExecutor(
    max_workers=3)  # Limit concurrent downloads


# Initialize the API
api = HfApi()


# Async function to handle the download in the background
# 🔹 Function to handle the actual model download (Runs in a separate thread)
# 🔹 Synchronous function to handle download & progress
# 🔹 Function to track download progress manually
# Track file download progress manually
async def track_download_progress(model_path, model_id, sid, sio, interval=5):
    """Continuously tracks download progress and emits updates."""
    previous_size = 0

    while model_id in running_tasks:
        # Wait a few seconds before checking again
        await asyncio.sleep(interval)

        current_size = await get_folder_size(model_path)
        downloaded_mb = current_size / (1024 * 1024)  # Convert bytes to MB

        if current_size > previous_size:
            await sio.emit("progress", {
                "model_id": model_id,
                "downloaded_mb": downloaded_mb
            }, to=sid)

            previous_size = current_size  # Update previous size

        if not os.path.exists(model_path):  # Stop if folder is deleted
            break


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


async def get_folder_size(path):
    """Calculate total size of files in a directory (in bytes), checking if the path exists."""
    if not os.path.exists(path):
        raise FileNotFoundError(f"Path '{path}' does not exist.")

    total_size = 0
    for dirpath, _, filenames in os.walk(path):
        for f in filenames:
            fp = os.path.join(dirpath, f)
            if os.path.isfile(fp):
                total_size += os.path.getsize(fp)

    return total_size


async def get_folder_size_async(path):
    return await asyncio.to_thread(get_folder_size, path)


async def run_snapshot_download(model_id, model_path):
    """Run `snapshot_download` in a separate thread to prevent blocking the event loop."""
    return await asyncio.to_thread(
        snapshot_download, repo_id=model_id, local_dir=model_path, resume_download=True
    )


async def fetch_and_save_model_files(model_id, save_path, repo_type="model"):
    """
    Fetch and save the list of all available files for a model before downloading.
    Uses HfApi().list_repo_tree() to ensure we get ALL files, including metadata.

    :param model_id: Hugging Face model ID (e.g., "PramaLLC/BEN2")
    :param save_path: Directory to save the file list
    :param repo_type: Repository type ("model", "dataset", or "space")
    :return: Path to the saved JSON file
    """
    try:
        os.makedirs(save_path, exist_ok=True)

        # ✅ Use HfApi to get a full list of files, including metadata
        api = HfApi()
        file_list = api.list_repo_tree(repo_id=model_id, repo_type=repo_type)

        if not file_list:
            print(f"❌ No files found for model {model_id}")
            return None

        # Convert to a structured list (filename, size, etc.)
        structured_files = [
            {"path": file.path, "size": file.size, "type": file.type} for file in file_list
        ]

        file_list_path = os.path.join(save_path, "files_to_download.json")

        # Save the file list
        with open(file_list_path, "w") as f:
            json.dump(structured_files, f, indent=4)

        print(f"✅ File list saved at: {file_list_path}")
        return file_list_path

    except Exception as e:
        print(f"❌ Error fetching model files: {str(e)}")
        return None


async def download_file_async(model_id, file_name, save_path):
    """
    Run hf_hub_download in a non-blocking way using asyncio.to_thread.
    """
    return await asyncio.to_thread(hf_hub_download, repo_id=model_id, filename=file_name, local_dir=save_path)


async def download_model_files(model_id, save_path):
    """
    Download model files after saving the file list (Non-Blocking).
    """
    file_list_path = await fetch_and_save_model_files(model_id, save_path)
    if not file_list_path:
        print("❌ Failed to fetch file list. Aborting download.")
        return None

    with open(file_list_path, "r") as f:
        files_to_download = json.load(f)

    # Use asyncio.gather for concurrent downloads
    download_tasks = [download_file_async(
        model_id, file_name, save_path) for file_name in files_to_download]
    results = await asyncio.gather(*download_tasks)

    return save_path


async def download_with_progress(model_id, sid, sio):
    try:
        print(f"🚀 Starting download for {model_id} using snapshot_download...")

        # ✅ Get the download path
        download_path = await get_download_path()
        if not download_path:
            raise ValueError("Download path is not set in the database")

        model_path = os.path.join(download_path, model_id)
        os.makedirs(model_path, exist_ok=True)  # Ensure directory exists

        # ✅ Emit initialization event
        await sio.emit("status", {"model_id": model_id, "status": "Downloading model"}, to=sid)
        # size = await get_folder_size_async(model_path)
        # ✅ Run `snapshot_download` in a separate thread (non-blocking)
        # final_path = await asyncio.to_thread(snapshot_download, repo_id=model_id, local_dir=model_path, resume_download=True)

        final_path = snapshot_download(
            repo_id=model_id, local_dir=model_path, resume_download=True)

        # ✅ Emit completion event
        await sio.emit("completed", {"model_id": model_id, "model_path": final_path}, to=sid)

        return model_path

    except Exception as e:
        await sio.emit("error", {"model_id": model_id, "error": str(e)}, to=sid)


async def stop_download(model_id, sid, sio):
    """Stops a running download."""
    if model_id in running_tasks:
        print(f"Stopping download for {model_id}...")
        running_tasks[model_id].cancel()
        del running_tasks[model_id]
        await sio.emit("status", {"model_id": model_id, "status": "Cancelled"}, to=sid)
    else:
        await sio.emit("error", {"model_id": model_id, "error": "No active download"}, to=sid)

# 🔹 Background task to run snapshot_download in a separate thread


async def download_model_in_background(sid, model_id, sio):
    try:
        await sio.emit("status", {"model_id": model_id, "status": "Initializing Download"}, to=sid)

        # ✅ Get the download path
        download_path = await get_download_path()
        if not download_path:
            raise ValueError("Download path is not set in the database")

        model_path = os.path.join(download_path, model_id)
        os.makedirs(model_path, exist_ok=True)  # Ensure directory exists
        # ✅ Start the download in the background
        final_path = await download_model_files(model_id, model_path)
        if final_path:
            print(f"🎉 Download completed! Files saved at: {final_path}")

        # ✅ Calculate model size after download
        total_size = await get_folder_size(final_path)
        size_storage = convert_storage_unit(total_size)

        # ✅ Save details to database
        async with async_session_maker() as db:
            result = await db.execute(select(Model).where(Model.model_name == model_id))
            existing_model = result.scalars().first()

            if existing_model:
                existing_model.path = final_path
                existing_model.size = size_storage.size
                existing_model.unit = size_storage.unit
            else:
                new_model = Model(
                    model_name=model_id,
                    path=final_path,
                    size=size_storage.size,
                    unit=size_storage.unit
                )
                db.add(new_model)

            await db.commit()

        print("✅ Download complete:", final_path)
        await sio.emit("status", {"model_id": model_id, "status": f"Download complete, saved at {final_path}"}, to=sid)
        return final_path

    except SQLAlchemyError as e:
        await db.rollback()
        print(f"❌ Database error: {e}")
        return {"error": "Database error occurred"}

    except Exception as e:
        await sio.emit("error", {"model_id": model_id, "error": str(e)}, to=sid)


def convert_storage_unit(size: float) -> ModelSizeResponse:
    used_storage_mb = round(size / (1024 ** 2), 2)
    used_storage_gb = round(size / (1024 ** 3), 2)

    if used_storage_gb >= 1:
        return ModelSizeResponse(size=used_storage_gb, unit='GB')
    else:
        return ModelSizeResponse(size=used_storage_mb, unit='MB')


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


def delete_model_folder(model_id: str, base_path: str) -> bool:
    # Construct the full path
    model_path = os.path.join(base_path, model_id)

    try:
        # Check if the folder exists
        if os.path.exists(model_path):
            if os.path.isdir(model_path):
                shutil.rmtree(model_path)  # Delete the folder
                print(f"✅ Successfully deleted: {model_path}")
                return True
            else:
                print(f"⚠️ {model_path} is not a directory!")
                return False
        else:
            print(f"❌ Path does not exist: {model_path}")
            return False

    except PermissionError:
        print(f"🔒 Permission denied: {model_path}")
        os.system(f"sudo rm -rf {model_path}")  # Try with sudo
        return os.path.exists(model_path) == False  # ✅ Return True if deleted

    except Exception as e:
        print(f"❌ Error deleting {model_path}: {e}")
        return False


async def Delete_Model(sid, model_id, sio):
    async with async_session_maker() as db:  # ✅ Ensure it's an instance, not a callable
        try:
            result = await db.execute(select(Model).where(Model.model_name == model_id))
            model: Model = result.scalars().first()

            if model is None:
                await sio.emit("error", {"model_id": model_id, "message": "No Model Found in Database"}, to=sid)
                return

            setting = await Get_Settings()

            if setting is None:
                await sio.emit("error", {"model_id": model_id, "message": "Path Not Found"}, to=sid)
                return

            path = setting['modelDownloadPath']  # Get the file path
            model_name = model.model_name  # Get the file path

            # Emit event: Initialization
            await sio.emit("progress", {"model_id": model_id, "status": "Initializing Deletion"}, to=sid)

            # Delete the file from disk
            if os.path.exists(path):
                result = delete_model_folder(model_name, path)

                if result is True:
                    await sio.emit("progress", {"model_id": model_id, "status": "File Deleted"}, to=sid)
                else:
                    await sio.emit("error", {"model_id": model_id, "status": "File Cannot Be Deleted"}, to=sid)
            else:
                await sio.emit("warning", {"model_id": model_id, "message": "File not found, skipping file deletion"}, to=sid)

            # Delete the model entry from the database
            await db.delete(model)
            await db.commit()  # Commit the transaction

            # Emit event: Completion
            await sio.emit("completed", {"model_id": model_id, "status": "Model Successfully Deleted"}, to=sid)

        except SQLAlchemyError as e:
            await db.rollback()
            print(f"Database error: {e}")
            await sio.emit("error", {"model_id": model_id, "message": "Database error occurred"}, to=sid)

        except Exception as e:
            await db.rollback()
            print(f"Unexpected error: {e}")
            await sio.emit("error", {"model_id": model_id, "message": str(e)}, to=sid)


async def load_transformer_model(model_id: str, save_path: str = "./models"):
    """
    Load a transformer model from Hugging Face, avoiding re-downloads if possible.

    :param model_id: Hugging Face model ID (e.g., "PramaLLC/BEN2")
    :param save_path: Local directory to store the model
    :return: Loaded model and tokenizer
    """
    model_path = os.path.join(save_path, model_id.replace("/", "_"))

    # Ensure the directory exists
    os.makedirs(model_path, exist_ok=True)

    # Check if model exists locally
    model_files = ["config.json", "pytorch_model.bin", "tokenizer.json"]
    is_downloaded = all(os.path.exists(os.path.join(model_path, f))
                        for f in model_files)

    if is_downloaded:
        print(f"✅ Using cached model from {model_path}")
        local_files_only = True
    else:
        print(f"📥 Downloading model {model_id} from Hugging Face...")
        local_files_only = False

    # Load model and tokenizer (download only if needed)
    model = AutoModel.from_pretrained(model_path if is_downloaded else model_id,
                                      cache_dir=save_path, local_files_only=local_files_only)
    tokenizer = AutoTokenizer.from_pretrained(model_path if is_downloaded else model_id,
                                              cache_dir=save_path, local_files_only=local_files_only)

    print(f"🎯 Model ready: {model_id}")
    return model, tokenizer
