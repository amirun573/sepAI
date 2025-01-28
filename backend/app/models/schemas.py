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

# Combined schema for the entire response
class DeviceSpecResponse(BaseModel):
    device_specifications: DeviceSpecifications
    device_condition: DeviceCondition

