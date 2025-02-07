# sepAI
Open Source to pick your favourite AI Model.


# Getting Started
Prerequisites
1. Python 3.8+ (for Backend)

2. Node.js 16+ (for Frontend)

# Run FastAPI (Backend)
1. `cd backend`
2. `virtualenv venv`
3. `source venv/bin/activate`
4.  `uvicorn main:app --reload`

For Alambic migration. Can run
1. `alembic revision --autogenerate -m "{message}"`
2. Then, run `alembic upgrade head`

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
