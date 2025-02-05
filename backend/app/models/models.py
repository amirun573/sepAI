from sqlalchemy import Column, Integer, String
from database import Base

class User(Base):
    __tablename__ = "users"

    user_id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String, index=True)
    email = Column(String, unique=True, index=True)

class Model(Base):
    __tablename__ = "models"

    model_id = Column(Integer, primary_key=True, index=True)
    model_name = Column(String, index=True)
    path = Column(String, unique=True, index=True)
    size = Column(float, index=True)
    unit = Column(String, index=True)

class PathDownloadModel(Base):
    __tablename__ = "download_path_models"

    path_download_id = Column(Integer, primary_key=True, index=True)
    path_download_name = Column(String, index=True)

