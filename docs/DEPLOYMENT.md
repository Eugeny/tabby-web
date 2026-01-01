# Tabby Web Deployment Guide

This guide covers deploying Tabby Web in production environments.

## Table of Contents

- [Quick Start](#quick-start)
- [Prerequisites](#prerequisites)
- [Docker Compose Deployment](#docker-compose-deployment)
- [Reverse Proxy Configuration](#reverse-proxy-configuration)
- [OAuth Provider Setup](#oauth-provider-setup)
- [Adding Tabby Versions](#adding-tabby-versions)
- [Connection Gateway](#connection-gateway)
- [Troubleshooting](#troubleshooting)

## Quick Start

```bash
# Clone the repository
git clone https://github.com/Eugeny/tabby-web.git
cd tabby-web

# Configure OAuth (at minimum, one provider)
export SOCIAL_AUTH_GITHUB_KEY=your_github_client_id
export SOCIAL_AUTH_GITHUB_SECRET=your_github_client_secret

# Build and start
export DOCKER_BUILDKIT=1
docker-compose up -d

# Add a Tabby version
docker-compose exec tabby /manage.sh add_version 1.0.208

# Access at http://localhost:9090
```

## Prerequisites

### System Requirements

| Resource | Minimum | Recommended |
|----------|---------|-------------|
| CPU | 2 cores | 2+ cores |
| RAM | 2GB (4GB for building) | 2GB |
| Disk | 5GB | 10GB |

### Software Requirements

- Docker 20.10+ with Docker Compose
- Docker BuildKit enabled (`export DOCKER_BUILDKIT=1`)

### OAuth Credentials

You need OAuth credentials from at least one provider:
- **GitHub**: Create an OAuth App at https://github.com/settings/developers
- **GitLab**: Create an Application at https://gitlab.com/-/profile/applications
- **Google**: Create OAuth credentials at https://console.cloud.google.com/apis/credentials
- **Microsoft**: Register an app at https://portal.azure.com/#blade/Microsoft_AAD_RegisteredApps

## Docker Compose Deployment

### 1. Create Environment File

Create a `.env` file in the project root:

```env
# Database (included MariaDB uses these defaults)
DATABASE_URL=mysql://root:123@db/tabby

# OAuth Provider (configure at least one)
SOCIAL_AUTH_GITHUB_KEY=your_client_id
SOCIAL_AUTH_GITHUB_SECRET=your_client_secret

# Optional: Custom app distribution storage
# APP_DIST_STORAGE=s3://bucket-name/path
```

### 2. Configure docker-compose.yml

For production, update the `docker-compose.yml`:

```yaml
services:
  tabby:
    build: .
    restart: always
    depends_on:
      - db
    ports:
      - "127.0.0.1:9090:80"  # Bind to localhost only (use reverse proxy)
    environment:
      - DATABASE_URL=mysql://root:${DB_PASSWORD}@db/tabby
      - DEBUG=False
      - SOCIAL_AUTH_GITHUB_KEY=${SOCIAL_AUTH_GITHUB_KEY}
      - SOCIAL_AUTH_GITHUB_SECRET=${SOCIAL_AUTH_GITHUB_SECRET}
    volumes:
      - app-dist:/app/app-dist  # Persist app distributions

  db:
    image: mariadb:10.7.1
    restart: always
    environment:
      MARIADB_DATABASE: tabby
      MYSQL_ROOT_PASSWORD: ${DB_PASSWORD}
    volumes:
      - db-data:/var/lib/mysql  # Persist database

volumes:
  app-dist:
  db-data:
```

### 3. Build and Start

```bash
export DOCKER_BUILDKIT=1
docker-compose up -d --build
```

### 4. Verify Deployment

```bash
# Check container status
docker-compose ps

# Check logs
docker-compose logs -f tabby

# Test the application
curl http://localhost:9090/api/1/auth/providers
```

## Reverse Proxy Configuration

### Nginx

```nginx
server {
    listen 443 ssl http2;
    server_name tabby.example.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    location / {
        proxy_pass http://127.0.0.1:9090;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # WebSocket support (for terminal)
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

### Traefik

```yaml
http:
  routers:
    tabby:
      rule: Host(`tabby.example.com`)
      entryPoints:
        - websecure
      service: tabby
      tls:
        certResolver: letsencrypt

  services:
    tabby:
      loadBalancer:
        servers:
          - url: http://tabby:80
```

### Caddy

```caddyfile
tabby.example.com {
    reverse_proxy localhost:9090
}
```

## OAuth Provider Setup

### GitHub

1. Go to https://github.com/settings/developers
2. Click "New OAuth App"
3. Set Authorization callback URL to: `https://tabby.example.com/complete/github/`
4. Copy Client ID and Client Secret

```env
SOCIAL_AUTH_GITHUB_KEY=your_client_id
SOCIAL_AUTH_GITHUB_SECRET=your_client_secret
```

### Google

1. Go to https://console.cloud.google.com/apis/credentials
2. Create OAuth 2.0 Client ID
3. Add authorized redirect URI: `https://tabby.example.com/complete/google-oauth2/`

```env
SOCIAL_AUTH_GOOGLE_OAUTH2_KEY=your_client_id
SOCIAL_AUTH_GOOGLE_OAUTH2_SECRET=your_client_secret
```

### Azure AD (Single Tenant)

For organization-only access:

1. Go to https://portal.azure.com
2. Register a new application
3. Add redirect URI: `https://tabby.example.com/complete/azuread-tenant-oauth2/`
4. Create a client secret
5. Note your Tenant ID from the Overview page

```env
SOCIAL_AUTH_AZUREAD_TENANT_OAUTH2_KEY=your_client_id
SOCIAL_AUTH_AZUREAD_TENANT_OAUTH2_SECRET=your_client_secret
SOCIAL_AUTH_AZUREAD_TENANT_OAUTH2_TENANT_ID=your_tenant_id
```

## Adding Tabby Versions

After deployment, add Tabby app versions:

```bash
# Add a specific version
docker-compose exec tabby /manage.sh add_version 1.0.208

# Check available versions at:
# https://www.npmjs.com/package/tabby-web-container
```

## Connection Gateway

For SSH and Telnet connections, you need the [tabby-connection-gateway](https://github.com/Eugeny/tabby-connection-gateway).

### Option 1: Use Hosted Gateway

After logging in, the default gateway is already configured. No additional setup needed.

### Option 2: Self-Hosted Gateway

1. Deploy the gateway: https://github.com/Eugeny/tabby-connection-gateway
2. In Tabby Web settings, enter your gateway address and auth token

## Troubleshooting

### Build Fails with Memory Error

The frontend build requires significant memory. Solutions:
- Use a machine with at least 4GB RAM for building
- Use a pre-built Docker image (when available)
- Increase Docker memory limit

### "No authentication providers configured"

No OAuth providers are set. Configure at least one:
```bash
docker-compose exec tabby printenv | grep SOCIAL_AUTH
```

### Database Connection Errors

```bash
# Check database is running
docker-compose ps db

# Check database logs
docker-compose logs db

# Test connection
docker-compose exec tabby python -c "import django; django.setup(); from django.db import connection; connection.ensure_connection()"
```

### OAuth Callback Errors

Verify your callback URLs match exactly:
- GitHub: `https://YOUR_DOMAIN/complete/github/`
- Google: `https://YOUR_DOMAIN/complete/google-oauth2/`
- Azure AD: `https://YOUR_DOMAIN/complete/azuread-tenant-oauth2/`

### Container Starts but Page is Blank

Check for JavaScript errors in browser console. Common causes:
- Mixed content (HTTP/HTTPS mismatch)
- CORS issues
- Missing app distribution

```bash
# Check if app distribution exists
docker-compose exec tabby ls -la /app/app-dist/
```
