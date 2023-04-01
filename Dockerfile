FROM mcr.microsoft.com/playwright/python:v1.32.1-focal
ENV HOME=/usr/src/app/bin
ENV PYTHONDONTWRITEBYTECODE=1
WORKDIR /usr/src/app
COPY pyproject.toml .
RUN python3 -m pip install --upgrade pip && python3 -m pip install .[dev]
