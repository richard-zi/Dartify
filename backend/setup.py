from setuptools import setup, find_packages

setup(
    name="dartify-backend",
    version="0.1.0",
    packages=find_packages(),
    install_requires=[
        "fastapi==0.110.0",
        "uvicorn==0.27.1",
        "python-multipart==0.0.9",
        "numpy==1.26.4",
        "opencv-python==4.9.0.80",
        "pydantic==2.6.3",
        "ultralytics==8.1.13",
        "supervision==0.18.0",
        "python-dotenv==1.0.1",
        "websockets==12.0",
    ],
    python_requires=">=3.8",
)