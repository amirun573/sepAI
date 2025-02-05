import os
from .os import OSHandler

class WindowsHandler(OSHandler):
    def get_appdata_path(self) -> str:
        return os.path.join(os.getenv("APPDATA"), self.app_name)
