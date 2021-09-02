#!/bin/sh
cd /app
./manage.py migrate
./manage.py collectstatic --noinput
gunicorn
