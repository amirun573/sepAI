
from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field

class ChatResponse(BaseModel):
    chat_id: int
    role: str
    content: str
    created_at: datetime
    is_read: bool
    status: str