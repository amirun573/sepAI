import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from app.models.device.os.factory import OSFactory

# Get the OS-specific handler
os_handler = OSFactory.get_os_handler()
appdata_dir = os_handler.ensure_appdata_exists()

# Define database path
DATABASE_PATH = os.path.join(appdata_dir, "app.db")
DATABASE_URL = f"sqlite:///{DATABASE_PATH}"

# Setup SQLAlchemy
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Dependency for FastAPI routes
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
