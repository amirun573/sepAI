from fastapi import APIRouter, Depends, HTTPException
from typing import List, Dict
from sqlalchemy.exc import SQLAlchemyError  # Import to catch DB errors

from app.models.setting.setting import Get_Settings


# Create the router inside the class
class SettingController:
    router = APIRouter()

    @router.get("/")
    async def setting_app():
        """Fetch settings with proper error handling."""
        setting = await Get_Settings()

        # If there's an error in fetching settings, return a 500 response
        if isinstance(setting, dict) and "error" in setting:
            raise HTTPException(status_code=500, detail=setting["error"])

        return setting

    @router.patch("/model_path")
    async def update_model_path():
        """Fetch settings with proper error handling."""
        setting = await Get_Settings()

        # If there's an error in fetching settings, return a 500 response
        if isinstance(setting, dict) and "error" in setting:
            raise HTTPException(status_code=500, detail=setting["error"])


# Instantiate the controller
setting_controller = SettingController()

# Include the router from the controller
router = setting_controller.router
