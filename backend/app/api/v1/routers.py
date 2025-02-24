from fastapi import APIRouter
from app.api.v1.endpoints.devices import router as devices_router
from app.api.v1.endpoints.model import router as model_router
from app.api.v1.endpoints.setting import router as setting_router
from app.api.v1.endpoints.chat import router as chat_router

api_router = APIRouter()

# Include the devices router
api_router.include_router(devices_router, prefix="/devices", tags=["devices"])
api_router.include_router(model_router, prefix="/models", tags=["models"])
api_router.include_router(setting_router, prefix="/settings", tags=["settings"])
api_router.include_router(chat_router, prefix="/chats", tags=["chats"])