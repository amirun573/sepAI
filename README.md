# sepAI

## Open Source to Pick Your Favourite AI Model
sepAI is an open-source application that allows you to explore, select, and run your favorite AI models effortlessly.

---

## 🚀 Download sepAI

[![Download for Mac](https://img.shields.io/badge/Download%20for-Mac-000?logo=apple&style=for-the-badge)](https://mega.nz/folder/21BB3CyI#BX53r3QoQIH0sDw0-9RAZA)
[![Download for Windows](https://img.shields.io/badge/Download%20for-Windows-0078D6?logo=windows&style=for-the-badge)](your-windows-download-link)

---

## 📌 Getting Started
### Prerequisites
Ensure you have the following installed before proceeding:
- **Python 3.9+** (for Backend)
- **Node.js 16+** (for Frontend)

---

## 🔥 Run FastAPI Backend
1. Navigate to the backend directory:
   ```sh
   cd backend
   ```
2. Create and activate a virtual environment:
   ```sh
   python3 -m venv venv
   source venv/bin/activate  # macOS & Linux
   .\venv\Scripts\Activate   # Windows
   ```
3. Start the FastAPI server:
   ```sh
   uvicorn main:app --reload
   ```

---

## 🔧 Convert Python to an Executable File
### Steps to Build the Executable
1. Ensure you are running in the virtual environment.
2. Clean previous builds:
   ```sh
   rm -rf build/ dist/ __pycache__/ main.spec
   ```
3. Run the appropriate build command:
   - **Mac:**
     ```sh
     pyinstaller --hidden-import=transformers --hidden-import=torch --hidden-import=aiosqlite --hidden-import=alembic \
     --collect-data=torch --collect-data=transformers --copy-metadata=fastapi --copy-metadata=pydantic \
     --copy-metadata=starlette --copy-metadata=alembic --add-data="alembic:alembic" --add-data="alembic.ini:." \
     --onefile --name=main main.py
     ```
   - **Windows:**
     ```sh
     pyinstaller --hidden-import=transformers --hidden-import=torch --hidden-import=aiosqlite --hidden-import=alembic \
     --collect-data torch --collect-data transformers --copy-metadata fastapi --copy-metadata pydantic \
     --copy-metadata starlette --copy-metadata alembic --add-data "alembic;alembic" --add-data "alembic.ini;." \
     --onefile --name main main.py
     ```
4. The executable file will be available in `dist/main`.

---

## 📜 Database & Migrations
### Alembic Migrations
1. Generate a migration script:
   ```sh
   alembic revision --autogenerate -m "{message}"
   ```
2. Apply the migration:
   ```sh
   alembic upgrade head
   ```

### Troubleshooting Migrations
If migration issues occur, reset the Alembic version table:
```sh
DROP TABLE alembic_version;
```
Then, regenerate the migrations using the steps above.

### Check SQLite Database Path
Run the following commands in Python:
```python
from database import DATABASE_PATH
print(DATABASE_PATH)
```

---

## 🌍 Run Next.js Frontend
1. Navigate to the frontend directory:
   ```sh
   cd frontend
   ```
2. Start the development server:
   ```sh
   npm run dev
   ```

---

## 📜 License
This software is free to use, modify, and distribute for **non-commercial purposes only**.
> **Commercial use is strictly prohibited** without explicit permission from the copyright holder.

---

## 🤝 Contributing
We welcome contributions! Follow these steps to contribute:
1. **Fork** the repository.
2. **Create a new branch** for your feature or bug fix.
3. **Submit a pull request** with a detailed description of your changes.

Let's make sepAI even better together! 🚀

