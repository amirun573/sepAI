from typing import List, Optional
from pydantic import BaseModel, Field

class DownloadModelRequest(BaseModel):
    model_id: str

class DownloadModelResponse(BaseModel):
    message: str
    model_path: str
