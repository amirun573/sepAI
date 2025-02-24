import json
from app.models.schemas.base import BaseResponse, ErrorCode
from app.models.schemas.chat import ChatResponse
from sqlalchemy.future import select
from app.models.schemas.model import DownloadModelRequest, DownloadModelResponse, ModelSizeRequest, ModelSizeResponse, ModelSizeCalculate
from app.core.dependencies import get_db
from typing import List, Dict, Optional
from fastapi import WebSocket, HTTPException
import os
import asyncio
import time
import requests
from database import async_session_maker  # Import async session maker
from app.models.models import Chat
from sqlalchemy.exc import SQLAlchemyError  # Import to catch DB errors
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text  # ✅ Import text from SQLAlchemy

async def Chat_History(
    limit: int, 
    skip: int, 
    role: Optional[str] = None,
    is_read: Optional[bool] = None,
    status: Optional[str] = None
) -> BaseResponse[List[ChatResponse]]:
    try:
        async with async_session_maker() as db:
            query = "SELECT * FROM chats WHERE 1=1"
            params = {"limit": limit, "skip": skip}

            if role is not None:
                query += " AND role = :role"
                params["role"] = role
            if is_read is not None:
                query += " AND is_read = :is_read"
                params["is_read"] = is_read
            if status is not None:
                query += " AND status = :status"
                params["status"] = status

            query += " LIMIT :limit OFFSET :skip"

            # ✅ Wrap raw SQL query with text()
            result = await db.execute(text(query), params)  
            chats = result.fetchall()

            chat_data = [
                ChatResponse(id=row.id, message=row.message, sender=row.sender, timestamp=str(row.timestamp))
                for row in chats
            ]

            return BaseResponse(
                message="Chat history retrieved successfully",
                data=chat_data
            )
    
    except Exception as e:
        print(f"❌ Error Loading Chat History: {str(e)}")
        return BaseResponse(
            message="Failed to retrieve chat history",
            error_code="DB_CONNECTION_ERROR",
            data=[]
        )
    

async def Chat_Insert():
    try:
        async with async_session_maker() as db:
            return
    except Exception as e:
        print(f"❌ Error Insert Chat: {str(e)}")
        return BaseResponse(
            message="Database connection failed",
             error_code=ErrorCode.DB_CONNECTION_ERROR.value,
            data=[]
        )