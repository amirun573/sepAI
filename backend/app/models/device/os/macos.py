import asyncio
import json
import os
import subprocess

from app.models.schemas.device import DeviceGPUDetails
from .os import OSHandler 
from pathlib import Path
import torch



class MacOSHandler(OSHandler):

    def os_name(self) -> str:
        return "Darwin"
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

    def get_gpu_temperature(self):
        try:
            output = subprocess.check_output(["istats", "extra"], text=True)
            for line in output.splitlines():
                if "GPU" in line:
                    return float(line.split()[-2])  # Extract temperature value
        except Exception as e:
            print(f"Error retrieving GPU temperature: {e}")
        return 0.0

    def get_macos_gpu_info(self) -> DeviceGPUDetails:
        """Fetches GPU details on macOS using system_profiler and returns DeviceGPUDetails."""
        try:
            output = subprocess.check_output(["system_profiler", "SPDisplaysDataType", "-json"], text=True)
            gpu_info = json.loads(output)
            gpu_data = gpu_info.get("SPDisplaysDataType", [])

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
                temperature_C= 0.0  # Use iStats for temperature
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
        

    def async_event_loop_policy(self) -> bool:
        return False
    # Run the function


