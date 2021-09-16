# syntax=docker/dockerfile:1
FROM node:12-alpine AS build
ARG BACKEND_URL
WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn
COPY webpack* tsconfig.json ./
COPY assets assets
COPY src src
COPY theme theme
RUN yarn run build
RUN yarn run build:server

FROM node:12-alpine AS package
WORKDIR /app
COPY --from=0 /app/build build
COPY --from=0 /app/build-server build-server
COPY package.json .

CMD ["npm", "start"]
