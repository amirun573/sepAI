# sepAI
Open Source to pick your favourite AI Model.


# Getting Started
Prerequisites
1. Python 3.9+ (for Backend)

2. Node.js 16+ (for Frontend)

# Run FastAPI (Backend)
1. `cd backend`
2. `virtualenv venv`
3. `source venv/bin/activate`
4.  `uvicorn main:app --reload`/ `venv/bin/python -m uvicorn main:app --reload`

# Convert Python to Executable file
1. Ensure to run in enviroment.
2. Run `rm -rf build/ dist/ __pycache__/ main.spec` to clear cache.
3. Then, run `pyinstaller --hidden-import=transformers --hidden-import=torch --hidden-import=aiosqlite --onedir main.py`
4. Executable file will be in dist/main

For Alambic migration. Can run
1. `alembic revision --autogenerate -m "{message}"`
2. Then, run `alembic upgrade head`

If Migration Got problem,
1. Delete Alambic  Version Table `DROP TABLE alembic_version;`
2. Regenerate back using Alambic Migration Steps.

SQLite
Check Database Path
1. python
2. from database import DATABASE_PATH
3. print(DATABASE_PATH)



# Run Nextjs App Route Typescript (Frontend)
1. `cd frontend`
2. Run `npm run dev`



# License
This software is free to use, modify, and distribute for non-commercial purposes only.
Commercial use is strictly prohibited without explicit permission from the copyright holder.

# Contributing
We welcome contributions! If you'd like to contribute to sepAI, please follow these steps:

Fork the repository.

Create a new branch for your feature or bugfix.

Submit a pull request with a detailed description of your changes.
