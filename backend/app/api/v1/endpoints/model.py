
from fastapi import APIRouter, WebSocket, Query
from app.models.schemas.model import DownloadModelRequest, DownloadModelResponse, ModelSizeRequest, ModelSizeResponse
from app.models.model.model import model_size, Get_Model_Downloaded


class ModelController:

    MODEL_DIR = "models"

    router = APIRouter()

    @router.get("/model_size", response_model=ModelSizeResponse)
    async def download_model(model_id: str = Query(..., description="The ID of the model")):
        # Pass as an object
        saved_model = await model_size(ModelSizeRequest(model_id=model_id))

        if saved_model.size != "None":
            return ModelSizeResponse(size=saved_model.size, unit=saved_model.unit)
        else:
            return ModelSizeResponse(size=0, unit='')

    @router.get("/")
    async def get_models():
        return await Get_Model_Downloaded()  # Pass as an object


model_controller = ModelController()
router = model_controller.router
