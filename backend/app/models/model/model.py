from huggingface_hub import snapshot_download
from app.models.schemas.model import DownloadModelRequest, DownloadModelResponse
from app.core.dependencies import get_db
from typing import List, Dict


def Download_Model_Huggingface(request: DownloadModelRequest):
    try:
        model_id = request.model_id  # Extract model_id here
        model_path = snapshot_download(model_id)
        print(f"Model downloaded at: {model_path}")
        return DownloadModelResponse(message="Download started", model_path=f"models/{request.model_id}")
    except Exception as e:
        return DownloadModelResponse(message=str(e), model_path="None")

