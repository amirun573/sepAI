import os
import asyncio
import subprocess
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from sqlalchemy.orm import declarative_base
from alembic.config import Config
from alembic import command
from app.models.device.os.factory import OSFactory

# Get the OS-specific handler
os_handler = OSFactory.get_os_handler()
appdata_dir = os_handler.ensure_appdata_exists()

# Define database path
DATABASE_PATH = os.path.join(appdata_dir, "app.db")
# ✅ Use aiosqlite for async SQLite
DATABASE_URL = f"sqlite+aiosqlite:///{DATABASE_PATH}"

# Setup Async SQLAlchemy
engine = create_async_engine(DATABASE_URL, connect_args={
                             "check_same_thread": False})
async_session_maker = async_sessionmaker(
    bind=engine, expire_on_commit=False, class_=AsyncSession)
Base = declarative_base()


async def initialize_database():
    """Check if the database exists, create it if necessary, and run migrations."""
    db_exists = os.path.exists(DATABASE_PATH)

    if not db_exists:
        print("⚡ Database not found. Creating database...")
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)

    # Run migrations
    await run_migrations()


async def run_migrations():
    """Run Alembic migrations asynchronously."""
    alembic_cfg = Config("alembic.ini")
    print("⚡ Running Alembic migrations...")

    loop = asyncio.get_running_loop()
    await loop.run_in_executor(None, lambda: subprocess.run(["alembic", "upgrade", "head"], check=True))

    print("✅ Database is up to date.")

# Call this function in FastAPI's startup event instead of asyncio.run()


async def startup_event():
    await initialize_database()

# Dependency for FastAPI routes


async def get_db():
    async with async_session_maker() as session:
        yield session
