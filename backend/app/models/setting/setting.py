from typing import List, Dict
from fastapi import WebSocket, HTTPException
from database import get_db  # Import database session
from sqlalchemy.exc import SQLAlchemyError  # Import to catch DB errors

from app.models.models import Setting

from sqlalchemy.orm import Session
import os
from app.models.device.os.factory import OSFactory
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from database import async_session_maker  # Import async session maker

factory_OS = OSFactory()
db: AsyncSession = AsyncSession()


async def Get_Settings():
    """Fetch settings from the database and return errors properly."""
    async with async_session_maker() as db:
        try:
            # ✅ Correct way to fetch data
            result = await db.execute(select(Setting))
            settings = result.scalars().first()  # ✅ Extract the first result
            model_path = factory_OS.get_os_handler().get_model_path()
            cache_model_path = factory_OS.get_os_handler().get_cache_model_path()
            # If settings are not found, return a default response
            if not settings:
                
                return {
                    "modelDownloadPath": model_path,
                    "notification": False,
                    "log": False,
                    "cacheModelDownloadPath": cache_model_path,

                }
            if settings.path_store_name_main is not None:
                model_path = settings.path_store_name_main

            if settings.path_store_cache_model_main is not None:
                cache_model_path = settings.path_store_cache_model_main

            return {
                "modelDownloadPath": model_path,
                "notification": settings.notification_enable,
                "log": settings.log_enable,
                "cacheModelDownloadPath": cache_model_path,

            }

        except SQLAlchemyError as e:
            print(f"Database error: {e}")
            return {"error": "Database error occurred"}

        except Exception as e:
            print(f"Unexpected error: {e}")
            return {"error": str(e)}


async def Update_Model_Path(new_path: str):
    """Update or create path_store_name_main in settings table."""
    if not os.path.exists(new_path):
        try:
            os.makedirs(new_path)
        except OSError as e:
            return {"error": f"Failed to create path: {e}"}

    async with async_session_maker() as db:  # ✅ Proper async session handling
        try:
            result = await db.execute(select(Setting))
            setting = result.scalars().first()

            if not setting:
                setting = Setting(path_store_name_main=new_path)
                db.add(setting)
            else:
                setting.path_store_name_main = new_path

            await db.commit()
            return {"success": True, "message": "Path updated successfully"}

        except SQLAlchemyError as e:
            await db.rollback()
            print(f"Database error: {e}")
            return {"error": "Database error occurred"}

        except Exception as e:
            await db.rollback()
            print(f"Unexpected error: {e}")
            return {"error": str(e)}


async def Update_Notification(notification_status: bool):
    """Update or create path_store_name_main in settings table."""
    async with async_session_maker() as db:  # ✅ Proper async session handling
        try:
            result = await db.execute(select(Setting))
            setting = result.scalars().first()

            if not setting:
                setting = Setting(notification_enable=notification_status)
                db.add(setting)
            else:
                setting.notification_enable = notification_status

            await db.commit()
            return {"success": True, "message": "Notification updated successfully"}

        except SQLAlchemyError as e:
            await db.rollback()
            print(f"Database error: {e}")
            return {"error": "Database error occurred"}

        except Exception as e:
            await db.rollback()
            print(f"Unexpected error: {e}")
            return {"error": str(e)}
