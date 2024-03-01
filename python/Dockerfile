FROM mcr.microsoft.com/playwright/python:v1.41.2-jammy
WORKDIR /usr/src/app
COPY pyproject.toml .
RUN python3 -m pip install --upgrade pip && python3 -m pip install .[dev]
