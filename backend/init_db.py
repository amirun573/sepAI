from database import Base, engine

def init_db():
    """Initialize the database by creating tables if they don't exist."""
    print(f"Initializing database at: {engine.url}")
    Base.metadata.create_all(bind=engine)
    print("Database initialized successfully!")

if __name__ == "__main__":
    init_db()
