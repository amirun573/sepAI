import json
from app.models.multiproessing.AsyncProcessor import AsyncProcessor
from app.models.device.os.factory import OSFactory
from sqlalchemy.future import select
from huggingface_hub import snapshot_download, HfApi, list_repo_files, hf_hub_download
from app.models.schemas.model import DownloadModelRequest, DownloadModelResponse, ModelSizeRequest, ModelSizeResponse, ModelSizeCalculate
from app.core.dependencies import get_db
from typing import List, Dict
from fastapi import WebSocket, HTTPException
import os
from transformers import AutoModel, AutoTokenizer, AutoModelForMaskedLM, AutoConfig, AutoModelForCausalLM, pipeline, BitsAndBytesConfig
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
import traceback
import torch
from app.models.model.multi_model import MultiModalityConfig, MultiModalityModel
import huggingface_hub
import glob
import re
from concurrent.futures import ProcessPoolExecutor,ThreadPoolExecutor
from functools import partial
import gc
from collections import OrderedDict

os.environ["TOKENIZERS_PARALLELISM"] = "false"

progress_status: Dict[str, float] = {}
# Create a Socket.IO server
db: AsyncSession = AsyncSession()
# Store running tasks
running_tasks = {}
executor = concurrent.futures.ThreadPoolExecutor(
    max_workers=3)  # Limit concurrent downloads

# ✅ Limit cache size to avoid memory overflow
MAX_CACHE_SIZE = 3
MAX_MODELS = 1  # Set a limit on cached models
loaded_models = OrderedDict()# Initialize the API
api = HfApi()
huggingface_hub.constants.HUGGINGFACE_HUB_TIMEOUT_SEC = 300  # Set timeout to 5 minutes


async_processor = AsyncProcessor()  # Create an instance
device_os = OSFactory()

# Global variables for model and tokenizer
model = None
tokenizer = None
text_generator = None

# Store loaded models in a dictionary
loaded_models = {}

semaphore = asyncio.Semaphore(4)
thread_pool = ThreadPoolExecutor(max_workers=2)

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


async def load_transformer_model(model_id: str):
    """
    Load a transformer model from Hugging Face, using a custom cache path from settings.

    :param session: AsyncSession to fetch settings from the database
    :param model_id: Hugging Face model ID (e.g., "PramaLLC/BEN2")
    :return: Loaded model and tokenizer
    """
    async with async_session_maker() as db:  # ✅ Ensure it's an instance, not a callable
        # Retrieve settings from the database
        result = await db.execute(select(Setting.path_store_cache_model_main))
        cache_path = result.scalar_one_or_none()  # Get stored path or None

        # Default to "./models" if not set in DB
        save_path = cache_path if cache_path else "./models"
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

        # Load model and tokenizer
        model = AutoModel.from_pretrained(model_path if is_downloaded else model_id,
                                          cache_dir=save_path, local_files_only=local_files_only)
        tokenizer = AutoTokenizer.from_pretrained(model_path if is_downloaded else model_id,
                                                  cache_dir=save_path, local_files_only=local_files_only)

        print(f"🎯 Model ready: {model_id}")
        return model, tokenizer


async def download_model_to_cache(sid, model_id: str, sio):
    """
    Download a transformer model to a cached location specified in the database
    and store its metadata in the `models` table.

    :param sid: Socket.IO session ID for updates
    :param model_id: Hugging Face model ID (e.g., "PramaLLC/BEN2")
    :param sio: Socket.IO instance for real-time updates
    :return: Path where the model is stored
    """
    try:
        async with async_session_maker() as db:
            # Fetch cache path from settings
            result = await db.execute(select(Setting.path_store_cache_model_main))
            cache_path = result.scalar_one_or_none()

            if not cache_path:
                error_msg = "❌ No cache path found in settings."
                print(error_msg)
                await sio.emit("error", {"sid": sid, "message": error_msg})
                return None

            # Hugging Face stores models as "model--{model_id}" inside cache
            # model_path = os.path.join(cache_path, model_id.replace(
            #     '/', '--'))  # No "model--" prefix

            model_path = os.path.join(
                cache_path, f"models--{model_id.replace('/', '--')}")
            os.makedirs(model_path, exist_ok=True)
            print("model_path -->", model_path)

            # Check if model already exists in DB
            existing_model = await db.execute(select(Model).where(Model.path == model_path))
            existing_model = existing_model.scalars().first()

            if existing_model:
                msg = f"✅ Model {model_id} already stored in DB at: {model_path}"
                print(msg)
                await sio.emit("status", {"sid": sid, "message": msg})
                return model_path

            # Check if model is already cached
            model_files = ["config.json",
                           "pytorch_model.bin", "tokenizer.json"]
            is_downloaded = all(os.path.exists(
                os.path.join(model_path, f)) for f in model_files)

            if not is_downloaded:
                msg = f"📥 Downloading model {model_id} to cache..."
                print(msg)
                await sio.emit("status", {"sid": sid, "message": msg})

                loop = asyncio.get_running_loop()
                try:
                    # Asynchronously download model
                    await loop.run_in_executor(None, lambda: snapshot_download(
                        repo_id=model_id,
                        cache_dir=cache_path,
                        allow_patterns=["*"]  # Download everything
                    ))

                    msg = f"✅ Model {model_id} successfully cached."
                    print(msg)
                    await sio.emit("status", {"sid": sid, "message": msg})

                    # # Load model and tokenizer asynchronously
                    # model = await loop.run_in_executor(None, lambda: AutoModel.from_pretrained(
                    #     model_path, trust_remote_code=True, torch_dtype="auto"
                    # ))

                    # tokenizer = await loop.run_in_executor(None, lambda: AutoTokenizer.from_pretrained(model_path))

                except Exception as e:
                    error_msg = f"❌ Failed to download model {model_id}: {str(e)}"
                    print(error_msg)
                    traceback.print_exc()
                    await sio.emit("error", {"sid": sid, "message": error_msg})
                    return None

                msg = f"🎯 Model successfully cached at: {model_path}"
                print(msg)
                await sio.emit("status", {"sid": sid, "message": msg})

            # Ensure the model_path exists before listing files
            if not os.path.exists(model_path):
                error_msg = f"❌ Model path does not exist: {model_path}"
                print(error_msg)
                await sio.emit("error", {"sid": sid, "message": error_msg})
                return None
            # Get model size
            total_size = sum(
                os.path.getsize(os.path.join(model_path, f))
                for f in os.listdir(model_path)
                if os.path.isfile(os.path.join(model_path, f))
            )
            size_storage = convert_storage_unit(total_size)

            # Store metadata in DB
            new_model = Model(
                model_name=model_id,
                path=model_path,
                size=round(size_storage.size, 2),
                unit=size_storage.unit
            )
            db.add(new_model)
            await db.commit()

            msg = f"✅ Model {model_id} stored in the database."
            print(msg)
            await sio.emit("status", {"sid": sid, "message": msg})

            return model_path

    except Exception as e:
        error_msg = f"❌ An error occurred: {str(e)}"
        print(error_msg)
        traceback.print_exc()
        await sio.emit("error", {"sid": sid, "message": error_msg})
        return None


def get_snapshot_path(base_dir):
    # Construct the path to the snapshots directory
    snapshots_dir = os.path.join(base_dir, "snapshots")

    # Use glob to list all directories in the snapshots directory
    snapshot_folders = [d for d in glob.glob(
        os.path.join(snapshots_dir, "*")) if os.path.isdir(d)]

    if not snapshot_folders:
        raise ValueError(f"No snapshot folder found in {snapshots_dir}.")

    # If there are multiple snapshots, you can choose one based on your criteria.
    # Here we sort by modification time (latest first).
    snapshot_folders.sort(key=os.path.getmtime, reverse=True)

    # Return the first snapshot folder (most recent)
    return snapshot_folders[0]


async def get_or_load_model(model_id: int):
    """Retrieve model from memory or load it with a maximum cache size."""
    try:
        print("🔍 Checking loaded models:", loaded_models.keys())

        # ✅ Check if model is already loaded
        if model_id in loaded_models:
            print(f"✅ Model {model_id} already loaded. Moving to most recent.")
            loaded_models.move_to_end(model_id)  # Move accessed model to the end (most recently used)
            return loaded_models[model_id]

        loop = asyncio.get_running_loop()

        # ✅ Fetch model path asynchronously before switching to threads
        model_path = await load_model_from_db(model_id)
        if not model_path:
            print(f"❌ Model {model_id} not found in DB.")
            return None

        # ✅ Load the model off-thread
        future = loop.run_in_executor(executor, partial(_load_model_sync, model_id, model_path))
        text_generator = await asyncio.wait_for(future, timeout=100)  # ✅ Set timeout

        if text_generator:
            # ✅ Ensure memory limit is respected (evict oldest model if needed)
            if len(loaded_models) >= MAX_MODELS:
                oldest_model_id, _ = loaded_models.popitem(last=False)  # Remove the oldest (LRU)
                print(f"🗑️ Removing oldest model {oldest_model_id} to free memory...")
                unload_model(oldest_model_id)  # ✅ Properly unload model from memory

            # ✅ Cache new model
            loaded_models[model_id] = text_generator
            print(f"🚀 Model {model_id} loaded successfully.")
            return text_generator
        else:
            print(f"⚠️ Model {model_id} failed to load.")
            return None

    except asyncio.TimeoutError:
        print(f"❌ Loading model {model_id} timed out!")
        return None
    except Exception as e:
        print(f"❌ Error in get_or_load_model: {str(e)}")
        return None
    finally:
        # ✅ Clean up memory to prevent leaks
        gc.collect()
        device_os.clear_pytorch_cache()

def unload_model(model_id: int):
    """Unload a specific model from memory to free RAM."""
    if model_id in loaded_models:
        print(f"🗑️ Unloading model {model_id}...")
        del loaded_models[model_id]
        torch.cuda.empty_cache()
        gc.collect()


# def _load_model_off_thread(model_id: int):
#     """Helper function to load the model in a separate thread."""
#     try:
#         # Fetch model path from the database (blocking operation)
#         model_path = asyncio.run(load_model_from_db(model_id))
#         if not model_path:
#             return None

#         # Load the model (blocking operation)
#         return _load_model_sync(model_id, model_path)
#     except Exception as e:
#         print(f"❌ Error in _load_model_off_thread: {str(e)}")
#         return None

def _load_model_sync(model_id: int, model_path: str):
    """Synchronous function to load the model."""
    try:
        device = str(device_os.check_pytorch_device())
        print(f"📂 Loading model {model_id} from {model_path} on {device}...")

        model = AutoModelForCausalLM.from_pretrained(
            model_path,
            torch_dtype=torch.float16 if device in ["mps", "cuda"] else "auto",
            trust_remote_code=False
        )

        tokenizer = AutoTokenizer.from_pretrained(model_path, trust_remote_code=False)
        
        model.to(device)

        text_generator = pipeline(
            "text-generation",
            model=model,
            tokenizer=tokenizer,
            device_map="auto"
        )

        print(f"✅ Model {model_id} is ready!")
        return text_generator
    except Exception as e:
        print(f"❌ Error loading model {model_id}: {str(e)}")
        return None

async def load_model_from_db(model_id: int):
    """Fetch model path from the database."""
    try:
        async with async_session_maker() as db:
            print("🔍 Fetching model path for:", model_id)
            result = await db.execute(select(Model).where(Model.model_id == model_id))
            model_entry = result.scalars().first()

            if not model_entry:
                print(f"❌ Model {model_id} not found in the database.")
                return None

            model_path = get_snapshot_path(model_entry.path)
            print(f"📂 Found model path: {model_path}")

            return model_path
    except Exception as e:
        print(f"❌ Error fetching model {model_id}: {str(e)}")
        return None


async def load_model(model_id: int, model_path: str):
    """Loads the model into memory and stores it in a dictionary."""
    try:
        if model_id in loaded_models:
            print(f"✅ Model {model_id} already loaded.")
            return loaded_models[model_id]

        device = str(device_os.check_pytorch_device())
        print(f"📂 Loading model {model_id} from {model_path} on {device}...")

        model = AutoModelForCausalLM.from_pretrained(
            model_path,
            torch_dtype=torch.float16 if device in ["mps", "cuda"] else "auto",
            trust_remote_code=False
        )

        tokenizer = AutoTokenizer.from_pretrained(model_path, trust_remote_code=False)
        
        model.to(device)

        text_generator = pipeline(
            "text-generation",
            model=model,
            tokenizer=tokenizer,
            device_map="auto"
        )

        loaded_models[model_id] = text_generator  # Store generator in cache
        print(f"✅ Model {model_id} is ready!")
        return text_generator
    except Exception as e:
        print(f"❌ Error loading model {model_id}: {str(e)}")
        return None


async def prompt(model_id: int, prompt: str):
    return await _async_prompt(model_id, prompt)


async def _async_prompt(model_id: int, prompt: str):
    try:
        print("loaded_models", loaded_models)

        # ✅ Remove least used model if cache exceeds limit
        if str(model_id) not in loaded_models and len(loaded_models) >= MAX_CACHE_SIZE:
            removed_model_id, removed_model = loaded_models.popitem(last=False)
            del removed_model  # ✅ Explicitly delete the model
            gc.collect()  # ✅ Force garbage collection
            print(f"🗑️ Removed cached model {removed_model_id} to free memory.")

        # ✅ Check if model is already loaded
        if str(model_id) in loaded_models:
            print(f"✅ Using cached model {model_id}.")
            text_generator = loaded_models[str(model_id)]
        else:
            async with async_session_maker() as db:
                print("🔍 Fetching model_id -->", model_id)
                result = await db.execute(select(Model).where(Model.model_id == model_id))
                model_entry = result.scalars().first()

                if not model_entry:
                    print(f"❌ Model {model_id} not found in the database.")
                    return "Model not found"

                model_path = get_snapshot_path(model_entry.path)
                print(f"📂 Loading model from: {model_path}")

                text_generator = await get_or_load_model(model_id)
                if not text_generator:
                    return "Failed to load model"

                # ✅ Store model in cache
                loaded_models[model_id] = text_generator

        print("🚀 Start Generate Text")

         # ✅ Ensure we are getting the correct event loop
        loop = asyncio.get_running_loop()

        # ✅ Run _generate_text in ThreadPoolExecutor (with cleanup)
       # ✅ Run _generate_text in ThreadPoolExecutor (with cleanup)
        
        with ThreadPoolExecutor(max_workers=2) as pool:
            future = loop.run_in_executor(pool, partial(_generate_text, text_generator, prompt))
            
            try:
                generated_text = await asyncio.wait_for(future, timeout=100)  # Set timeout
            except asyncio.TimeoutError:
                print("❌ _generate_text timed out!")
                return "Timeout error"
            finally:
                # ✅ Shutdown ThreadPoolExecutor and clean up
                pool.shutdown(wait=False)  
                print("🛑 ThreadPoolExecutor shut down.")
                # ✅ Force garbage collection to free memory
                gc.collect()
                device_os.clear_pytorch_cache()


        if generated_text is None:
            print("❌ No output from _generate_text")


        print("✅ Generated Text:", generated_text)

        # # ✅ Force garbage collection to prevent memory leaks
        # gc.collect()

        # ✅ Check & Kill Zombie Processes
        #async_processor._cleanup_processes()

        return generated_text

    except Exception as e:
        print(f"❌ Error in _async_prompt for model {model_id}: {str(e)}")
        return f"Error generating response: {str(e)}"
    
def _generate_text(text_generator, prompt):
    try:
        print("🚀 _generate_text called with prompt:", prompt)  # ✅ Debugging log
        generated_text = text_generator(
            prompt,
            max_length=100,
            do_sample=True,
            top_k=50,
            top_p=0.95,
            truncation=True,
            repetition_penalty=1.2,
        )
        print("✅ _generate_text output:", generated_text)  # ✅ Debugging log

        # ✅ Ensure proper format
        return generated_text[0]["generated_text"].strip() if generated_text else None
    except Exception as e:
        print(f"❌ Error in _generate_text: {e}")
        return None
