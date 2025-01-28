from fastapi import FastAPI
from app.api.v1.routers import api_router

app = FastAPI()

# Include the API router
app.include_router(api_router, prefix="/api/v1")