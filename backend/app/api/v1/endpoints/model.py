from fastapi import APIRouter
from app.models.schemas.model import DownloadModelRequest, DownloadModelResponse
from app.models.model.model import Download_Model_Huggingface
router = APIRouter()

@router.post("/download", response_model=DownloadModelRequest)
async def download_model(request: DownloadModelRequest):
    saved_model = Download_Model_Huggingface(request)

    if(saved_model.model_path != "None"):
        return DownloadModelResponse(message="Download started", model_path=f"models/{request.model_id}")
    else:
        return DownloadModelResponse(message="Error downloading model", model_path="None")

