# syntax=docker/dockerfile:1
FROM node:12-alpine AS frontend-build
WORKDIR /app
COPY frontend/package.json frontend/yarn.lock ./
RUN yarn install --frozen-lockfile --network-timeout 1000000
COPY frontend/webpack* frontend/tsconfig.json ./
COPY frontend/assets assets
COPY frontend/src src
COPY frontend/theme theme
RUN yarn run build
RUN yarn run build:server

FROM node:12-alpine AS frontend
WORKDIR /app
COPY --from=frontend-build /app/build build
COPY --from=frontend-build /app/build-server build-server
COPY frontend/package.json .

CMD ["npm", "start"]

# ----

FROM python:3.7-alpine AS build-backend
ARG EXTRA_DEPS

RUN apk add build-base musl-dev libffi-dev openssl-dev mariadb-dev bash curl

WORKDIR /app

# Rust (for python-cryptography)
RUN curl https://sh.rustup.rs -sSf | bash -s -- -y
ENV PATH /root/.cargo/bin:$PATH

RUN pip install -U setuptools cryptography==37.0.4 poetry==1.1.7
COPY backend/pyproject.toml backend/poetry.lock ./
RUN poetry config virtualenvs.path /venv
RUN poetry install --no-dev --no-ansi --no-interaction
RUN poetry run pip install -U setuptools psycopg2-binary $EXTRA_DEPS

COPY backend/manage.py backend/gunicorn.conf.py ./
COPY backend/tabby tabby
COPY --from=frontend /app/build /frontend

ARG BUNDLED_TABBY=1.0.187-nightly.1

RUN FRONTEND_BUILD_DIR=/frontend /venv/*/bin/python ./manage.py collectstatic --noinput
RUN APP_DIST_STORAGE=file:///app-dist /venv/*/bin/python ./manage.py add_version ${BUNDLED_TABBY}

FROM python:3.7-alpine AS backend

ENV APP_DIST_STORAGE file:///app-dist
ENV DOCKERIZE_VERSION v0.6.1
ENV DOCKERIZE_ARCH amd64
ARG TARGETPLATFORM
RUN if [ "$TARGETPLATFORM" = "linux/arm64" ]; \
    then export DOCKERIZE_ARCH=armhf; \
    else export DOCKERIZE_ARCH=amd64; \
    fi
RUN wget https://github.com/jwilder/dockerize/releases/download/$DOCKERIZE_VERSION/dockerize-linux-$DOCKERIZE_ARCH-$DOCKERIZE_VERSION.tar.gz \
    && tar -C /usr/local/bin -xzvf dockerize-linux-$DOCKERIZE_ARCH-$DOCKERIZE_VERSION.tar.gz \
    && rm dockerize-linux-$DOCKERIZE_ARCH-$DOCKERIZE_VERSION.tar.gz

RUN apk add mariadb-connector-c

COPY --from=build-backend /app /app
COPY --from=build-backend /app-dist /app-dist
COPY --from=build-backend /venv /venv

COPY backend/start.sh backend/manage.sh /
RUN chmod +x /start.sh /manage.sh
CMD ["/start.sh"]
