from fastapi import APIRouter
from app.api.v1.endpoints.devices import router as devices_router
from app.api.v1.endpoints.model import router as model_router

api_router = APIRouter()

# Include the devices router
api_router.include_router(devices_router, prefix="/devices", tags=["devices"])
api_router.include_router(model_router, prefix="/models", tags=["models"])