from app.models.schemas.device import DeviceCreate, DeviceGPUDetails, DeviceResponse,DeviceSpecResponse, GPUInfo, GPUResponse
from app.core.dependencies import get_db
from typing import List, Dict
import psutil
import platform
import GPUtil
import subprocess
import json
from app.models.device.os.macos import MacOSHandler

# Create an instance of the MacOSHandler class
mac_handler = MacOSHandler()

def get_device_spec() -> Dict[str, str]:

    spec = {
        "name": platform.node(),  # Get the hostname (device name)
        "model": platform.machine(),  # Get machine type (e.g., x86_64)
        "cpu": platform.processor(),  # Get processor name
        "cpu_logical_threads": psutil.cpu_count(logical=True),  # Get total number of CPU cores including hyperthreading
        "cpu_physcial_cores": psutil.cpu_count(logical=False),  # Get total number of CPU cores including hyperthreading
        "ram": f"{round(psutil.virtual_memory().total / (1024 ** 3))} GB",  # RAM in GB
        "storage": f"{round(psutil.disk_usage('/').total / (1024 ** 3))} GB",  # Total disk space in GB
        "os": platform.system(),  # OS name (e.g., Windows, Linux)
    }
    return spec

def get_device_condition() -> Dict[str, str]:
    condition = {
        "status": "healthy" if psutil.cpu_percent() < 90 else "critical",  # CPU usage < 90% considered healthy
        "cpu_usage": f"{psutil.cpu_percent()}%",  # Current CPU usage percentage
        "memory_usage": f"{psutil.virtual_memory().percent}%",  # Current memory usage percentage
        "disk_usage": f"{psutil.disk_usage('/').percent}%",  # Current disk usage percentage
        "battery_level": get_battery_level(),
        "temperature": get_temperature(),
    }
    return condition

def get_battery_level() -> int:
    battery = psutil.sensors_battery()
    if battery:
        return battery.percent
    return 100  # Return 100 if no battery is found (e.g., for a server)

def get_temperature() -> float:
    try:
        temperatures = psutil.sensors_temperatures()
        if "coretemp" in temperatures:
            return temperatures["coretemp"][0].current  # Return the temperature of the first core (if available)
    except AttributeError:
        pass
    return 30.0  # Default temperature if not available



def get_gpu_info() -> DeviceGPUDetails:
    """Fetch GPU details based on the operating system and return a DeviceGPUDetails object."""
    try:
        if platform.system() == "Darwin":

            gpu_list = mac_handler.get_macos_gpu_info()

            return DeviceGPUDetails(
                    name=gpu_list.name,
                    memory_total_MB=gpu_list.memory_total_MB,
                    memory_used_MB=gpu_list.memory_used_MB,
                    memory_free_MB=gpu_list.memory_used_MB,
                    load_percent=0.0,
                    temperature_C=0.0
                )
        else:
            gpu_list = GPUtil.getGPUs()
            if not gpu_list:
                return DeviceGPUDetails(
                    name="Unknown",
                    memory_total_MB="0",
                    memory_used_MB="0",
                    memory_free_MB="0",
                    load_percent=0.0,
                    temperature_C=0.0
                )

            print('gpu_list-->',gpu_list)
            # Assume the first GPU is the primary one
            gpu = gpu_list[0]
            return DeviceGPUDetails(
                name=gpu.name,
                memory_total_MB=str(int(gpu.memoryTotal)),  # Convert int to str
                memory_used_MB=str(int(gpu.memoryUsed)),  # Convert int to str
                memory_free_MB=str(int(gpu.memoryFree)),  # Convert int to str
                load_percent=gpu.load * 100,
                temperature_C=gpu.temperature
            )

    except Exception as e:
        print(f"An error occurred while retrieving GPU information: {e}")
        return DeviceGPUDetails(
            name="Unknown",
            memory_total_MB="0",
            memory_used_MB="0",
            memory_free_MB="0",
            load_percent=0.0,
            temperature_C=0.0
        )

