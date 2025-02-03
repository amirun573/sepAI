import asyncio
import os
from app.models.model.model import MODEL_DIR
from fastapi import APIRouter, WebSocket, Query
from app.models.schemas.model import DownloadModelRequest, DownloadModelResponse, ModelSizeRequest, ModelSizeResponse
from app.models.model.model import Download_Model_Huggingface, Download_Model_With_Progress, model_size
import socketio
from huggingface_hub import snapshot_download



class ModelController:

    MODEL_DIR = "models"

    router = APIRouter()

  
    @router.post("/download", response_model=DownloadModelRequest)
    async def download_model(request: DownloadModelRequest):
        saved_model = Download_Model_Huggingface(request)

        if(saved_model.model_path != "None"):
            return DownloadModelResponse(message="Download started", model_path=f"models/{request.model_id}")
        else:
            return DownloadModelResponse(message="Error downloading model", model_path="None")

    @router.websocket("/ws/download/{model_id}")
    async def websocket_endpoint(websocket: WebSocket, model_id: str):
        """WebSocket connection for download progress updates."""
        await websocket.accept()
        await Download_Model_With_Progress(model_id, websocket)
        await websocket.close()

    @router.get("/model_size", response_model=ModelSizeResponse)
    async def download_model(model_id: str = Query(..., description="The ID of the model")):
        saved_model = await model_size(ModelSizeRequest(model_id=model_id))  # Pass as an object

        print("Model size: ", saved_model.size)
        if saved_model.size != "None":
            return ModelSizeResponse(size=saved_model.size)
        else:
            return ModelSizeResponse(size=0)

model_controller = ModelController()
router = model_controller.router