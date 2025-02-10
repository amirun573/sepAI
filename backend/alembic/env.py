import os
import sys
from logging.config import fileConfig

from alembic import context
from sqlalchemy import create_engine
from sqlalchemy.ext.asyncio import create_async_engine

# Add the app's root directory to sys.path so that imports work
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

# Import database engine and Base
from database import DATABASE_URL, engine, Base  # Import your database setup

# This is the Alembic Config object, which provides access to the .ini file
config = context.config

# Interpret the config file for Python logging
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# Set target metadata for autogenerate to work
from app.models.models import Base
target_metadata = Base.metadata
def run_migrations_offline() -> None:
    """Run migrations in 'offline' mode without connecting to the database."""
    url = str(engine.url)  # Get URL directly from your database engine
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )

    with context.begin_transaction():
        context.run_migrations()


# Create a **sync** database engine for Alembic
SYNC_DATABASE_URL = DATABASE_URL.replace("sqlite+aiosqlite:///", "sqlite:///")  # Change async SQLite to sync SQLite
sync_engine = create_engine(SYNC_DATABASE_URL)

def run_migrations_online():
    """Run migrations in 'online' mode."""
    connectable = sync_engine  # Use the **sync** engine here

    with connectable.connect() as connection:
        context.configure(
            connection=connection,
            target_metadata=Base.metadata,
        )

        with context.begin_transaction():
            context.run_migrations()


# Determine migration mode (offline or online)
if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
