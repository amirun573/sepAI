from setuptools import setup, find_packages

def read_requirements():
    with open("requirements.txt", encoding="utf-8") as f:
        return [line.strip() for line in f if line.strip() and not line.startswith("#")]

setup(
    name="sepai-studio-backend",
    version="1.0.0",
    packages=find_packages(),
    install_requires=read_requirements(),
    entry_points={
        "console_scripts": [
            "sepai-server = app.main:main"  # ✅ Creates an executable-like command
        ]
    },
)