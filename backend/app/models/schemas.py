from typing import List
from pydantic import BaseModel

class DeviceCreate(BaseModel):
    name: str

class DeviceResponse(BaseModel):
    id: int
    name: str

# Schema for device specifications
class DeviceSpecifications(BaseModel):
    name: str
    model: str
    cpu: str
    ram: str
    storage: str
    os: str

# Schema for device condition
class DeviceCondition(BaseModel):
    status: str
    cpu_usage: str
    memory_usage: str
    disk_usage: str
    battery_level: int
    temperature: float

class DeviceGPUDetails(BaseModel):
     name: str
     memory_total_MB: str
     memory_used_MB: str
     memory_free_MB: str
     load_percent: float
     temperature_C: float


# Combined schema for the entire response
class DeviceSpecResponse(BaseModel):
    device_specifications: DeviceSpecifications
    device_condition: DeviceCondition
    gpu_details: DeviceGPUDetails

class GPUInfo(BaseModel):
    GPU: str
    memory_total_MB: int  # Total memory in MB
    memory_used_MB: int   # Used memory in MB
    memory_free_MB: int   # Free memory in MB
    load_percent: float   # Load percentage
    temperature_C: float  # Temperature in Celsius

class GPUResponse(BaseModel):
    gpu_details: List[GPUInfo]