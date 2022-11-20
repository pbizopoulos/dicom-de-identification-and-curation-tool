FROM mcr.microsoft.com/playwright/python:v1.27.1-focal
WORKDIR /work
COPY pyproject.toml .
RUN python3 -m pip install --no-cache-dir --upgrade pip && python3 -m pip install --no-cache-dir .
