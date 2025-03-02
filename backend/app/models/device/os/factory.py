import gc
import platform
from .windows import WindowsHandler
from .macos import MacOSHandler
from .linux import LinuxHandler
import torch
import os

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

    def get_count_cpus(self):
        """
        Get the number of CPUs available.
        """
        return os.cpu_count()

    def get_available_gpus():
        """Detect GPU availability on macOS M-Series or other devices."""
        if torch.backends.mps.is_available():
            return 1  # MPS supports only 1 GPU
        elif torch.cuda.is_available():
            return torch.cuda.device_count()
        else:
            return 0  # No GPU available
    def clear_pytorch_cache(self):
        try:
                """
                Clears the PyTorch cache for MPS (Metal) and CUDA to free up GPU memory.
                """
                if torch.backends.mps.is_available():
                    try:
                        torch.mps.empty_cache()
                        print("🧹 Cleared MPS (Metal) GPU cache")
                    except AttributeError:
                        print("⚠️ MPS cache clearing is not supported in this PyTorch version.")

                if torch.cuda.is_available():
                    torch.cuda.empty_cache()
                    torch.cuda.ipc_collect()  # Helps reclaim fragmented memory

                    print("🧹 Cleared CUDA GPU cache")

                gc.collect()  # ✅ Force garbage collection to free memory
                print("🧹 Cleared system memory using garbage collection")

                return True

        except Exception as e:
            print(f"❌ Error clearing PyTorch cache: {e}")
            return False


# # Usage
# device_os = OSFactory()
# device = device_os.check_pytorch_device()  # ✅ This will work now
