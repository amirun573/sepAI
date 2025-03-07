import os

from pathlib import Path  # Correct import
from .os import OSHandler
import asyncio
class WindowsHandler(OSHandler):
    def os_name(self) -> str:
        return "Windows"
    def get_appdata_path(self) -> str:
        return os.path.join(os.getenv("APPDATA"), self.app_name)
    def get_model_path(self) -> str:
        base_path = Path(os.getenv("APPDATA", Path.home() / "AppData/Roaming")) / self.app_name
        model_path = base_path / "model"
        model_path.mkdir(parents=True, exist_ok=True)  # Ensure folder exists

        return str(model_path)
    def get_cache_model_path(self) -> str:
            base_path = Path(os.getenv("APPDATA", Path.home() / "AppData/Roaming")) / self.app_name
            model_path = base_path / "cache" /"model"
            model_path.mkdir(parents=True, exist_ok=True)  # Ensure folder exists

            return str(model_path)
    def async_event_loop_policy(self)-> bool:
        asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())
        return True
