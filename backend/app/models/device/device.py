from app.models.schemas import DeviceCreate, DeviceResponse,DeviceSpecResponse, GPUInfo, GPUResponse
from app.core.dependencies import get_db
from typing import List, Dict
import psutil
import platform
import GPUtil


def get_device_spec() -> Dict[str, str]:
    spec = {
        "name": platform.node(),  # Get the hostname (device name)
        "model": platform.machine(),  # Get machine type (e.g., x86_64)
        "cpu": platform.processor(),  # Get processor name
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



def get_gpu_info() -> GPUResponse:
    gpus = GPUtil.getGPUs()
    if not gpus:
        return GPUResponse(gpu_details=[GPUInfo(
            GPU="No GPU detected",
            memory_total_MB=0,
            memory_used_MB=0,
            memory_free_MB=0,
            load_percent=0.0,
            temperature_C=30.0  # Default temperature
        )])
    gpu_info = []
    for gpu in gpus:
        gpu_info.append(GPUInfo(
            GPU=gpu.name,
            memory_total_MB=gpu.memoryTotal,
            memory_used_MB=gpu.memoryUsed,
            memory_free_MB=gpu.memoryFree,
            load_percent=gpu.load * 100,  # Convert load to percentage
            temperature_C=gpu.temperature,  # Assuming `gpu.temperature` is available, if not, use a default value
        ))
    return GPUResponse(gpu_details=gpu_info)