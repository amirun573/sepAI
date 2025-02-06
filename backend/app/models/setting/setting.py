from typing import List, Dict
from fastapi import WebSocket, HTTPException
from database import get_db  # Import database session
from sqlalchemy.exc import SQLAlchemyError  # Import to catch DB errors

from app.models.models import Setting

from sqlalchemy.orm import Session
import os
from app.models.device.os.factory import OSFactory

factory_OS = OSFactory()

async def Get_Settings():
    """Fetch settings from the database and return errors properly."""
    try:
        db = next(get_db())  # Get the database session
        settings = db.query(Setting).first()
        db.close()  # Close session after use

        # If settings are not found, return a 404 response
        if not settings:
             model_path = factory_OS.get_os_handler().get_model_path()

             return {
            "modelDownloadPath": model_path,
            "notification": False,
            "log": False,
            }
            #raise HTTPException(status_code=404, detail="Settings not found")

        return {
            "modelDownloadPath": settings.path_store_name_main,
            "notification": settings.notification_enable,
            "log": settings.log_enable,
        }

    except SQLAlchemyError as e:
        # Log the error and return the exception
        print(f"Database error: {e}")
        return {"error": "Database error occurred"}

    except Exception as e:
        # Log the unexpected error and return it
        print(f"Unexpected error: {e}")
        return {"error": str(e)}

async def Update_Model_Path():
    """Fetch settings from the database and return errors properly."""
    try:
        db = next(get_db())  # Get the database session
        settings = db.query(Setting).first()
        db.close()  # Close session after use

        return settings

    except SQLAlchemyError as e:
        # Log the error and return the exception
        print(f"Database error: {e}")
        return {"error": "Database error occurred"}

    except Exception as e:
        # Log the unexpected error and return it
        print(f"Unexpected error: {e}")
        return {"error": str(e)}