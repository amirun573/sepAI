from typing import List, Optional
from pydantic import BaseModel, Field

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
    cpu_logical_threads: int
    cpu_physcial_cores: int


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
    name: str = Field(..., description="GPU name")
    memory_total_MB: int = Field(..., description="Total GPU memory in MB")
    memory_used_MB: int = Field(..., description="Used GPU memory in MB")
    memory_free_MB: int = Field(..., description="Free GPU memory in MB")
    load_percent: float = Field(..., description="GPU usage percentage")
    temperature_C: float = Field(..., description="GPU temperature in Celsius")

class GPUResponse(BaseModel):
    gpu_details: List[GPUInfo] = Field(default_factory=list, description="List of GPU details")