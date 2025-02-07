import os
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from sqlalchemy.orm import declarative_base
from app.models.device.os.factory import OSFactory

# Get the OS-specific handler
os_handler = OSFactory.get_os_handler()
appdata_dir = os_handler.ensure_appdata_exists()

# Define database path
DATABASE_PATH = os.path.join(appdata_dir, "app.db")
DATABASE_URL = f"sqlite+aiosqlite:///{DATABASE_PATH}"  # ✅ Use aiosqlite for async SQLite

# Setup Async SQLAlchemy
engine = create_async_engine(DATABASE_URL, connect_args={"check_same_thread": False})
async_session_maker = async_sessionmaker(bind=engine, expire_on_commit=False, class_=AsyncSession)
Base = declarative_base()

# Dependency for FastAPI routes
async def get_db():
    async with async_session_maker() as session:
        yield session
