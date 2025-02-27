import platform
from .windows import WindowsHandler
from .macos import MacOSHandler
from .linux import LinuxHandler
import torch
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
    def check_pytorch_device(self)-> str:
        """
        Checks if PyTorch can use MPS (Metal Performance Shaders) on Mac 
        and prints available devices.
        """
        mps_available = torch.backends.mps.is_available()
        cuda_available = torch.cuda.is_available()
        device = "mps" if mps_available else ("cuda" if cuda_available else "cpu")

        print(f"✅ PyTorch Version: {torch.__version__}")
        print(f"🖥️  Selected Device: {device}")
        print(f"🎯 MPS Available: {mps_available}")
        print(f"🚀 CUDA Available: {cuda_available}")

        if mps_available:
            print("🔥 MPS is enabled. Running on Apple Silicon GPU!")
        elif cuda_available:
            print("⚡ CUDA is enabled. Running on NVIDIA GPU!")
        else:
            print("⚠️ No GPU detected. Running on CPU.")

        return torch.device(device)


# Usage
device_os = OSFactory()
device = device_os.check_pytorch_device()  # ✅ This will work now
