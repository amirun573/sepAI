from fastapi import APIRouter, Depends, HTTPException
from app.models.schemas import DeviceCreate, DeviceResponse,DeviceSpecResponse
from app.core.dependencies import get_db
from typing import List, Dict
import psutil
import platform
import json


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
# Create the router inside the class
class DeviceController:
    router = APIRouter()

    @router.get("/", response_model=List[DeviceResponse])
    def read_items(self, skip: int = 0, limit: int = 10):
        # Replace with actual database logic
        fake_items = [{"id": 1, "name": "Foo"}, {"id": 2, "name": "Bar"}]
        return fake_items[skip : skip + limit]
    
    @router.get("/spec", response_model=DeviceSpecResponse)
    async def spec_lists():
        device_spec = get_device_spec()
        device_condition = get_device_condition()
    
        # Combine both specs and condition into a single dictionary
        result = {
            "device_specifications": device_spec,
            "device_condition": device_condition
        }
    
        # Convert the result to JSON and print
        return result

    @router.post("/", response_model=DeviceResponse)
    def create_item(self, item: DeviceCreate):
        # Replace with actual database logic
        fake_item = {"id": 1, "name": item.name}
        return fake_item

# Instantiate the controller
device_controller = DeviceController()

# Include the router from the controller
router = device_controller.router