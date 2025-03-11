import os
import asyncio
import subprocess
import sys
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
def get_alembic_config():
    """Get the correct path for alembic.ini and migration scripts."""
    base_dir = getattr(sys, '_MEIPASS', os.path.abspath(os.path.dirname(__file__)))
    
    # Adjust path for PyInstaller
    alembic_ini_path = os.path.join(base_dir, "alembic.ini")
    alembic_migration_path = os.path.join(base_dir, "alembic")

    if not os.path.exists(alembic_ini_path):
        raise FileNotFoundError(f"ERROR: Alembic config not found at {alembic_ini_path}")

    alembic_cfg = Config(alembic_ini_path)
    alembic_cfg.set_main_option("script_location", alembic_migration_path)  # 👈 Fix migration path

    return alembic_cfg

async def run_migrations():
    """Run Alembic migrations asynchronously using the Alembic API."""
    print("⚡ Running Alembic migrations...")

    alembic_cfg = get_alembic_config()
    loop = asyncio.get_running_loop()

    await loop.run_in_executor(None, lambda: command.upgrade(alembic_cfg, "head"))

    print("✅ Database is up to date.")

# Call this function in FastAPI's startup event instead of asyncio.run()


async def startup_event():
    await initialize_database()

# Dependency for FastAPI routes


async def get_db():
    async with async_session_maker() as session:
        yield session