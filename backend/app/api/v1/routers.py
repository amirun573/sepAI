from fastapi import APIRouter
from app.api.v1.endpoints.devices import router as devices_router

api_router = APIRouter()

# Include the devices router
api_router.include_router(devices_router, prefix="/devices", tags=["devices"])