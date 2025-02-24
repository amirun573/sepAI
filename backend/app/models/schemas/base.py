from typing import List, Optional, Generic, TypeVar
from pydantic import BaseModel
from enum import Enum


# Generic Response Model
T = TypeVar("T")
class ErrorCode(str, Enum):
    INVALID_REQUEST = "INVALID_REQUEST"
    AUTHENTICATION_FAILED = "AUTHENTICATION_FAILED"
    DB_CONNECTION_ERROR = "DB_CONNECTION_ERROR"
    RESOURCE_NOT_FOUND = "RESOURCE_NOT_FOUND"

class BaseResponse(BaseModel, Generic[T]):
    message: str
    data: Optional[T] = None
    error_code: Optional[str] = None  # Optional for error responses