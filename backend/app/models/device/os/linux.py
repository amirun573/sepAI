import os

from pathlib import Path  # Correct import
from .os import OSHandler

class LinuxHandler(OSHandler):

    def os_name(self) -> str:
        return "Linux"
    
    def get_appdata_path(self) -> str:
        return os.path.expanduser(f"~/.local/share/{self.app_name}")
    
    def get_model_path(self) -> str:
        base_path = Path.home() / f".{self.app_name.lower()}"
        model_path = base_path / "model"
        model_path.mkdir(parents=True, exist_ok=True)  # Ensure folder exists

        return str(model_path)

    def get_cache_model_path(self) -> str:
        base_path = Path.home() / f".{self.app_name.lower()}"
        model_path = base_path / "cache" / "model"
        model_path.mkdir(parents=True, exist_ok=True)  # Ensure folder exists

        return str(model_path)