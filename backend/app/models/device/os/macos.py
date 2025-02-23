import json
import os
import subprocess

from app.models.schemas.device import DeviceGPUDetails
from .os import OSHandler 
from pathlib import Path
import torch

class MacOSHandler(OSHandler):
    def get_appdata_path(self) -> str:
        return os.path.expanduser(f"~/Library/{self.app_name}")
    
    def get_appdata_path(self) -> str:
        return os.path.expanduser(f"~/Library/{self.app_name}")
        
    def get_model_path(self) -> str:
        base_path = Path.home() / "Library" / self.app_name
        model_path = base_path / "model"
        model_path.mkdir(parents=True, exist_ok=True)  # Ensure folder exists

    def get_cache_model_path(self) -> str:
        base_path = Path.home() / "Library" / self.app_name
        model_path = base_path / "cache" / "model"
        model_path.mkdir(parents=True, exist_ok=True)  # Ensure folder exists

        return str(model_path)
    def get_thermal_snapshot(self, timeout=5):
        try:
            process = subprocess.Popen(["pmset", "-g", "thermlog"], stdout=subprocess.PIPE, text=True)
            
            for line in process.stdout:
                print(line.strip())  # Print the line
                
                # Stop when we detect this message
                if "No thermal warning level has been recorded" in line:
                    print("✅ Detected end of data. Stopping process.")
                    process.terminate()
                    break
            
            # Wait for the process to complete (with timeout)
            process.communicate(timeout=timeout)
        
        except subprocess.TimeoutExpired:
            print("⏳ Timeout reached! Stopping process.")
            process.terminate()

        except Exception as e:
            print(f"⚠️ Error: {e}")
            process.terminate()

    def get_macos_gpu_info(self) -> DeviceGPUDetails:
        """Fetches GPU details on macOS using system_profiler and returns DeviceGPUDetails."""
        try:
            output = subprocess.check_output(["system_profiler", "SPDisplaysDataType", "-json"], text=True)
            gpu_info = json.loads(output)

            # components = subprocess.check_output(["pmset", "-g", "thermlog"], text=True)
            # components_info = json.loads(components)

            # print('components_info-->',components_info)

            gpu_data = gpu_info.get("SPDisplaysDataType", [])

            # get_thermal_snapshot(5)


            # try:
            #    process = subprocess.Popen(["sudo", "powermetrics", "--samplers", "gpu_power", "-i", "2000"],stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
            #    start_time = time.time()
            #    while time.time() - start_time < 5:  # Run for the given duration
            #         line = process.stdout.readline()
            #         if "GPU Power (W)" in line:
            #             print(line.strip())
            # except KeyboardInterrupt:
            #     process.terminate()  # Stop on user interrupt

            if not gpu_data:
                return DeviceGPUDetails(
                    name="Unknown",
                    memory_total_MB="0",
                    memory_used_MB="0",
                    memory_free_MB="0",
                    load_percent=0.0,
                    temperature_C=0.0
                )

            # Assume the first GPU is the primary one
            gpu = gpu_data[0]
            return DeviceGPUDetails(
                name=gpu.get("sppci_model", "Unknown"),
                memory_total_MB=gpu.get("spdisplays_vram", "0").split(" ")[0],  # Extract numeric value
                memory_used_MB="0",  # macOS doesn’t expose this directly
                memory_free_MB="0",  # macOS doesn’t expose this directly
                load_percent=0.0,  # No easy way to get load
                temperature_C=0.0  # No easy way to get temp
            )

        except Exception as e:
            print(f"Error retrieving macOS GPU info: {e}")
            return DeviceGPUDetails(
                name="Unknown",
                memory_total_MB="0",
                memory_used_MB="0",
                memory_free_MB="0",
                load_percent=0.0,
                temperature_C=0.0
            )

    def check_pytorch_device():
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

    # Run the function
    # device = check_pytorch_device()


