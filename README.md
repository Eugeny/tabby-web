# Using Docker images

Tabby Web consists of two Docker images - `backend` and `frontend`. See an example set up in `docker-compose.yml`

## Environment variables

### Frontend

* `BACKEND_URL`
* `WEB_CONCURRENCY`

### Backend

* `DATABASE_URL` (required).
* `FRONTEND_URL`
* `APP_DIST_STORAGE`: a `file://`, `s3://`, or `gcs://` URL to store app distros in.
* `SOCIAL_AUTH_*_KEY` & `SOCIAL_AUTH_*_SECRET`: social login credentials, supported providers are `GITHUB`, `GITLAB`, `MICROSOFT_GRAPH` and `GOOGLE_OAUTH2`.
* `ENABLE_HOMEPAGE`: set to `False` to disable the homepage and always redirect to the app.

## Installing Tabby app versions

* `docker-compose run backend ./manage.py add_version 1.0.156-nightly.1`
