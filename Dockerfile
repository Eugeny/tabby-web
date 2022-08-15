# syntax=docker/dockerfile:1
FROM node:12-alpine AS frontend-build
WORKDIR /app
COPY frontend/package.json frontend/yarn.lock ./
RUN yarn install --frozen-lockfile --network-timeout 1000000
COPY frontend/webpack* frontend/tsconfig.json ./
COPY frontend/assets assets
COPY frontend/src src
COPY frontend/theme theme
RUN yarn run build && yarn run build:server

FROM node:12-alpine AS frontend
WORKDIR /app
COPY --from=frontend-build /app/build build
COPY --from=frontend-build /app/build-server build-server
COPY frontend/package.json .

VOLUME /app-dist

CMD ["npm", "start"]

# ----

FROM python:3.7-alpine AS build-backend
ARG EXTRA_DEPS

WORKDIR /app

COPY backend/requirements.txt ./

RUN <<EOF
    set -x
    apk --no-cache add build-base musl-dev libffi-dev openssl-dev mariadb-dev
    pip install -U setuptools -r requirements.txt
EOF

COPY backend/pyproject.toml backend/poetry.lock ./
RUN <<EOF
    set -x
    poetry config virtualenvs.path /venv
    poetry install --no-dev --no-ansi --no-interaction
    poetry run pip install -U setuptools $EXTRA_DEPS
EOF

COPY backend/manage.py backend/gunicorn.conf.py ./
COPY backend/tabby tabby
COPY --from=frontend /app/build /frontend

ARG BUNDLED_TABBY=1.0.163

RUN <<EOF
    set -x
    FRONTEND_BUILD_DIR=/frontend /venv/*/bin/python ./manage.py collectstatic --noinput
    FRONTEND_BUILD_DIR=/frontend /venv/*/bin/python ./manage.py add_version ${BUNDLED_TABBY}
EOF

FROM python:3.7-alpine AS backend

ENV DOCKERIZE_VERSION=v0.6.1
ENV DOCKERIZE_ARCH=amd64
ARG TARGETPLATFORM
RUN <<EOF
    set -ex
    if [ "$TARGETPLATFORM" = "linux/arm64" ];
        then export DOCKERIZE_ARCH=armhf;
        else export DOCKERIZE_ARCH=amd64;
    fi
    
    wget https://github.com/jwilder/dockerize/releases/download/$DOCKERIZE_VERSION/dockerize-linux-$DOCKERIZE_ARCH-$DOCKERIZE_VERSION.tar.gz -O - | tar -xzv -C /usr/local/bin
    
    chown root:root /usr/local/bin/dockerize

    apk add --no-cache mariadb-connector-c
EOF

COPY --from=build-backend /app /app
COPY --from=build-backend /venv /venv

COPY --chmod=755 backend/start.sh backend/manage.sh /

CMD ["/start.sh"]
