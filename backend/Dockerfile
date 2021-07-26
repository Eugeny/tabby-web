# syntax=docker/dockerfile:1
FROM python:3.7-alpine AS build
RUN apk add build-base musl-dev libffi-dev openssl-dev mariadb-dev
WORKDIR /app
RUN pip install -U setuptools 'cryptography>=3.0,<3.1' poetry==1.1.7
COPY pyproject.toml poetry.lock ./
RUN poetry config virtualenvs.create false
RUN poetry install --no-dev --no-ansi --no-interaction

FROM node:12-alpine AS package
WORKDIR /app
COPY --from=0 /usr /usr
COPY start.sh manage.py gunicorn.conf.py ./
COPY tabby tabby
ENTRYPOINT ./start.sh
