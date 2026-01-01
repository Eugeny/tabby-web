# Tabby Web

## Note on project status

> [!IMPORTANT]  
> At this time I don't have the time to work on `tabby-web` and won't be able to provide help or support for it. I'm still happy to merge any fixes/improvement PRs. :v:


![](docs/screenshot.png)

This is the Tabby terminal, served as a web app. It also provides the config sync service for the Tabby app.

# How it works

Tabby Web serves the [Tabby Terminal](https://github.com/Eugeny/tabby) as a web application while managing multiple config files, authentication, and providing TCP connections via a [separate gateway service](https://github.com/Eugeny/tabby-connection-gateway).

# Requirements

## Software Requirements

* Python 3.10+ (3.12 recommended)
* Node.js 18+ (for frontend build)
* A database server supported by Django (MariaDB, Postgres, SQLite, etc.)
* Storage for distribution files - local, S3, GCS or others supported by `fsspec`
* Docker and Docker Compose (for containerized deployment)

## System Requirements

### Minimum (Build & Run)

| Resource | Requirement |
|----------|-------------|
| CPU | 2 cores |
| RAM | 2GB (4GB recommended for building) |
| Disk | 5GB |

> **Note:** Building the Docker image requires significant memory for the frontend compilation step. If you're running on a memory-constrained system (like Oracle Cloud Free Tier), consider using a pre-built image or building on a machine with more RAM.

### Runtime Only (Pre-built Image)

| Resource | Requirement |
|----------|-------------|
| CPU | 1 core |
| RAM | 512MB |
| Disk | 1GB + app distributions |

### Recommended (Production)

| Resource | Requirement |
|----------|-------------|
| CPU | 2+ cores |
| RAM | 2GB |
| Disk | 10GB |

# Quickstart (using `docker-compose`)

You'll need:

* OAuth credentials from GitHub, GitLab, Google or Microsoft for authentication.
* For SSH and Telnet: a [`tabby-connection-gateway`](https://github.com/Eugeny/tabby-connection-gateway) to forward traffic.
* Docker BuildKit: `export DOCKER_BUILDKIT=1`

```bash
    docker-compose up -e SOCIAL_AUTH_GITHUB_KEY=xxx -e SOCIAL_AUTH_GITHUB_SECRET=yyy
```

will start Tabby Web on port 9090 with MariaDB as a storage backend.

For SSH and Telnet, once logged in, enter your connection gateway address and auth token in the settings.

## Environment variables

* `DATABASE_URL` (required).
* `APP_DIST_STORAGE`: a `file://`, `s3://`, or `gcs://` URL to store app distros in.
* `SOCIAL_AUTH_*_KEY` & `SOCIAL_AUTH_*_SECRET`: social login credentials, supported providers are `GITHUB`, `GITLAB`, `MICROSOFT_GRAPH` and `GOOGLE_OAUTH2`.

## Adding Tabby app versions

* `docker-compose run tabby /manage.sh add_version 1.0.163`

You can find the available version numbers [here](https://www.npmjs.com/package/tabby-web-container).

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
