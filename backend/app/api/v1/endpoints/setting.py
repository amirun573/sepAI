from fastapi import APIRouter, Depends, HTTPException
from typing import List, Dict
from sqlalchemy.exc import SQLAlchemyError  # Import to catch DB errors

from app.models.setting.setting import Get_Settings, Update_Model_Path, Update_Notification


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

    @router.patch("/modelPathModel")
    async def update_model_path(request: dict):
        model_download_path = request.get("modelDownloadPath")

        if not model_download_path:
            raise HTTPException(status_code=400, detail="modelDownloadPath is required")
        """Fetch settings with proper error handling."""
        setting = await Update_Model_Path(model_download_path)

        # If there's an error in fetching settings, return a 500 response
        if isinstance(setting, dict) and "error" in setting:
            raise HTTPException(status_code=500, detail=setting["error"])
        
        return setting
    
    @router.patch("/notificationEnabler")
    async def update_model_path(request: dict):
        notification_status = request.get("notificationStatus")

        if not notification_status:
            raise HTTPException(status_code=400, detail="modelDownloadPath is required")
        """Fetch settings with proper error handling."""
        setting = await Update_Notification(notification_status)

        # If there's an error in fetching settings, return a 500 response
        if isinstance(setting, dict) and "error" in setting:
            raise HTTPException(status_code=500, detail=setting["error"])
        
        return setting
    


# Instantiate the controller
setting_controller = SettingController()

# Include the router from the controller
router = setting_controller.router
