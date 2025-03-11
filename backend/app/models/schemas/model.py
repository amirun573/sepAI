from typing import List, Optional
from pydantic import BaseModel, Field

class DownloadModelRequest(BaseModel):
    model_id: str

class DownloadModelResponse(BaseModel):
    message: str
    model_path: str

class ModelSizeRequest(BaseModel):
    model_id: str

class ModelSizeResponse(BaseModel):
    size: float
    unit: str

class ModelSizeCalculate(BaseModel):
    size: float
    unit: str

class PromptRequest(BaseModel):
    model_id: int
    prompt: str


class LoadModelResponse(BaseModel):
    status: bool
