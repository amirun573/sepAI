
from app.models.device.device import get_device_condition, get_device_spec, get_gpu_info
from fastapi import APIRouter, Depends, HTTPException,Query
from app.models.schemas.chat import ChatResponse
from typing import List, Optional
from app.models.chat.chat import Chat_History
from app.models.schemas.base import BaseResponse

class ChatController:
    router = APIRouter()

    @router.get("/history/", response_model=BaseResponse[List[ChatResponse]])
    async def get_chats(
        limit: int = Query(..., ge=1, le=100),  # Required, min 1, max 100
        skip: int = Query(0, ge=0),  # Defaults to 0
        role: Optional[str] = None,  # Optional filter
        is_read: Optional[bool] = None,  # Optional filter
        status: Optional[str] = None,  # Optional filter
    ):
        try:
            response = await Chat_History(limit=limit, skip=skip, role=role, is_read=is_read, status=status)
            return response  # Return fetched chat history
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")


chat_controller = ChatController()
router = chat_controller.router