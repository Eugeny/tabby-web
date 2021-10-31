# Tabby Web

![](docs/screenshot.png)

This is the exact code that runs at https://tabby.sh. In fact, it's being deployed straight out of this repository.

You can use this to deploy your own copy or to make improvements - pull requests are welcome!

# How it works

Tabby Web serves the [Tabby Terminal](https://github.com/Eugeny/tabby) as a web application while managing multiple config files, authentication, and providing TCP connections via a [separate gateway service](https://github.com/Eugeny/tabby-connection-gateway).

# Requirements

* Python 3.7+
* A database server supported by Django (MariaDB, Postgres, SQLite, etc.)
* Storage for distribution files - local, S3, GCS or others supported by `fsspec`

# Using Docker images

Tabby Web consists of two Docker images - `backend` and `frontend`. See an example set up in `docker-compose.yml`

## Environment variables

### Frontend

* `BACKEND_URL` (required if running the backend in a separate Docker container).
* `WEB_CONCURRENCY`

### Backend

* `DATABASE_URL` (required).
* `FRONTEND_URL`
* `APP_DIST_STORAGE`: a `file://`, `s3://`, or `gcs://` URL to store app distros in.
* `SOCIAL_AUTH_*_KEY` & `SOCIAL_AUTH_*_SECRET`: social login credentials, supported providers are `GITHUB`, `GITLAB`, `MICROSOFT_GRAPH` and `GOOGLE_OAUTH2`.

## Adding Tabby app versions

* `docker-compose run backend ./manage.py add_version 1.0.156-nightly.2`

# Development setup

Put your environment vars (`DATABASE_URL`, etc.) in the `.env` file in the root of the repo.

For the frontend:

```shell
cd frontend
yarn
yarn run build # or yarn run watch
```

For the backend:

```shell
cd backend
poetry install
./manage.py migrate # set up the database
./manage.py add_version 1.0.156-nightly.2 # install an app distribution
PORT=9000 poetry run gunicorn # optionally with --reload
```

# Security

* When using Tabby Web for SSH/Telnet connectivity, your traffic will pass through a hosted gateway service. It's encrypted in transit (HTTPS) and the gateway servers authenticate themselves with a certificate before connections are made. However there's a non-zero risk of a MITM if a gateway service is compromised and the attacker gains access to the service's private key.
* You can alleviate this risk by [hosting your own gateway service](https://github.com/Eugeny/tabby-connection-gateway), or your own copy of Tabby Web altogether.
