from app.models.device.device import get_device_condition, get_device_spec, get_gpu_info
from fastapi import APIRouter, Depends, HTTPException
from app.models.schemas import DeviceCreate, DeviceResponse,DeviceSpecResponse
from typing import List, Dict



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
        get_gpu = get_gpu_info()
        # Combine both specs and condition into a single dictionary
        result = {
            "device_specifications": device_spec,
            "device_condition": device_condition,
            "gpu_details": get_gpu
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