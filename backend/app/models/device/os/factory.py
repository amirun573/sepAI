import platform
from .windows import WindowsHandler
from .macos import MacOSHandler
from .linux import LinuxHandler

class OSFactory:
    """Factory class to get the correct OS handler."""
    
    @staticmethod
    def get_os_handler():
        system_name = platform.system()
        if system_name == "Windows":
            return WindowsHandler()
        elif system_name == "Darwin":  # macOS
            return MacOSHandler()
        else:  # Linux
            return LinuxHandler()
