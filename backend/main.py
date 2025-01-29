from fastapi import FastAPI
from app.api.v1.routers import api_router
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()
# Allow all origins (for development)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Change this to specific origins in production
    allow_credentials=True,
    allow_methods=["*"],  # Allow all HTTP methods
    allow_headers=["*"],  # Allow all headers
)
# Include the API router
app.include_router(api_router, prefix="/api/v1")