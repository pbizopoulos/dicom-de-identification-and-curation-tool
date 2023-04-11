FROM python:3.11.3
ENV HOME=/usr/src/app/bin
WORKDIR /usr/src/app
COPY pyproject.toml .
RUN python3 -m pip install --upgrade pip && python3 -m pip install .[dev]
