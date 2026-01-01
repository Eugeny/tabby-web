# Tabby Web

## Note on project status

> [!IMPORTANT]
> At this time I don't have the time to work on `tabby-web` and won't be able to provide help or support for it. I'm still happy to merge any fixes/improvement PRs. :v:


![](docs/screenshot.png)

This is the Tabby terminal, served as a web app. It also provides the config sync service for the Tabby app.

# How it works

Tabby Web serves the [Tabby Terminal](https://github.com/Eugeny/tabby) as a web application while managing multiple config files, authentication, and providing TCP connections via a [separate gateway service](https://github.com/Eugeny/tabby-connection-gateway).

# Requirements

* Python 3.7+
* A database server supported by Django (MariaDB, Postgres, SQLite, etc.)
* Storage for distribution files - local, S3, GCS or others supported by `fsspec`

# Quickstart (using `docker-compose`)

You'll need:

* **For OAuth login**: Credentials from GitHub, GitLab, Google, Microsoft, or Auth0.
* **For local login**: Just set `LOCAL_AUTH_ENABLED=true` (no OAuth required!)
* **For SSH and Telnet**: a [`tabby-connection-gateway`](https://github.com/Eugeny/tabby-connection-gateway) to forward traffic.

## Option 1: Pre-built Image (Recommended)

Use the pre-built image from GitHub Container Registry - no build required:

```bash
docker-compose -f docker-compose.prebuilt.yml up -d
```

The image is available at `ghcr.io/eugeny/tabby-web:latest`.

## Option 2: Build from Source

If you need to customize the build:

```bash
export DOCKER_BUILDKIT=1
docker-compose up -d
```

Both options will start Tabby Web on port 9090 with MariaDB as a storage backend.

For SSH and Telnet, once logged in, enter your connection gateway address and auth token in the settings.

## Environment variables

### Core Settings

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `DATABASE_URL` | Yes | - | Database connection URL (e.g., `mysql://user:pass@host/db`) |
| `APP_DIST_STORAGE` | No | `file://./app-dist` | Storage for app distributions (`file://`, `s3://`, `gcs://`) |
| `ALLOWED_HOSTS` | No | `*` | Comma-separated list of allowed hostnames |
| `DEBUG` | No | `false` | Enable debug mode (not for production) |

### Authentication Options

Tabby Web supports multiple authentication methods. You can enable any combination:

#### Local Username/Password (No OAuth Required!)

| Variable | Default | Description |
|----------|---------|-------------|
| `LOCAL_AUTH_ENABLED` | `false` | Enable username/password login |
| `LOCAL_AUTH_REGISTRATION_ENABLED` | `false` | Allow self-registration (requires `LOCAL_AUTH_ENABLED`) |

#### Proxy Authentication (Authentik, Authelia, etc.)

| Variable | Default | Description |
|----------|---------|-------------|
| `PROXY_AUTH_ENABLED` | `false` | Trust `X-Auth-*` headers from reverse proxy |

When enabled, the app trusts these headers:
- `X-Auth-User-Email` (required)
- `X-Auth-User-Name` (optional)

#### OAuth Providers

| Variable | Description |
|----------|-------------|
| `SOCIAL_AUTH_GITHUB_KEY` / `SECRET` | GitHub OAuth |
| `SOCIAL_AUTH_GITLAB_KEY` / `SECRET` | GitLab OAuth |
| `SOCIAL_AUTH_GOOGLE_OAUTH2_KEY` / `SECRET` | Google OAuth |
| `SOCIAL_AUTH_MICROSOFT_GRAPH_KEY` / `SECRET` | Microsoft OAuth |
| `SOCIAL_AUTH_AUTH0_DOMAIN` / `KEY` / `SECRET` | Auth0 |
| `SOCIAL_AUTH_AZUREAD_TENANT_OAUTH2_KEY` / `SECRET` / `TENANT_ID` | Azure AD (single tenant) |

### API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/health` | GET | Basic health check (load balancer probes) |
| `/ready` | GET | Readiness check (database connectivity) |
| `/live` | GET | Liveness check (uptime) |
| `/api/1/version` | GET | Version and build info |
| `/api/1/auth/status` | GET | Auth status and available providers |
| `/api/1/auth/local/login` | POST | Local username/password login |
| `/api/1/auth/local/register` | POST | Self-registration (if enabled) |

## Adding Tabby app versions

```bash
docker-compose run tabby /manage.sh add_version 1.0.163
```

You can find the available version numbers [here](https://www.npmjs.com/package/tabby-web-container).

## Creating a Local Admin User

If using local authentication, create an admin user:

```bash
docker-compose exec tabby python /app/manage.py createsuperuser
```

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

# Troubleshooting

## "Invalid HTTP_HOST header" error

Set the `ALLOWED_HOSTS` environment variable to include your domain:
```
ALLOWED_HOSTS=tabby.example.com,localhost
```

## "The redirect_uri MUST match" error

Ensure your OAuth callback URL matches exactly. For GitHub, use:
```
https://your-domain.com/complete/github/
```

## "Table doesn't exist" error

Run database migrations:
```bash
docker-compose exec tabby python /app/manage.py migrate
```

# Security

* When using Tabby Web for SSH/Telnet connectivity, your traffic will pass through a hosted gateway service. It's encrypted in transit (HTTPS) and the gateway servers authenticate themselves with a certificate before connections are made. However there's a non-zero risk of a MITM if a gateway service is compromised and the attacker gains access to the service's private key.
* You can alleviate this risk by [hosting your own gateway service](https://github.com/Eugeny/tabby-connection-gateway), or your own copy of Tabby Web altogether.
* When using `PROXY_AUTH_ENABLED`, ensure your reverse proxy is properly configured to strip any `X-Auth-*` headers from client requests before adding its own.
