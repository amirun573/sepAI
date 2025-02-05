import os
from .os import OSHandler

class LinuxHandler(OSHandler):
    def get_appdata_path(self) -> str:
        return os.path.expanduser(f"~/.local/share/{self.app_name}")
