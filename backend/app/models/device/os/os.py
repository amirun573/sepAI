import os
from abc import ABC, abstractmethod

class OSHandler(ABC):
    """Abstract base class for handling OS-specific paths."""

    def __init__(self, app_name: str = "SepAI-Studio"):
        self.app_name = app_name  # Allow dynamic app names

    @abstractmethod
    def get_appdata_path(self) -> str:
        """Returns the appropriate application data path for the OS."""
        pass

    def ensure_appdata_exists(self) -> str:
        """Creates the app data directory if it doesn't exist and returns the path."""
        path = self.get_appdata_path()
        os.makedirs(path, exist_ok=True)
        return path
