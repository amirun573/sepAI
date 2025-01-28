from pydantic.v1 import BaseSettings

class Settings(BaseSettings):
    app_name: str = "FastAPI OOP Example"
    debug: bool = True

    class Config:
        env_file = ".env"

settings = Settings()