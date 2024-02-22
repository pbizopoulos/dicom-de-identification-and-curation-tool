FROM python:3.12.1
WORKDIR /usr/src/app
COPY pyproject.toml .
RUN python3 -m pip install --upgrade pip && python3 -m pip install .[dev]
