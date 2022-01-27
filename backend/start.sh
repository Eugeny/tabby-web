#!/bin/sh
if [ -z "$var" ]; then
    dockerize $DOCKERIZE_ARGS
fi
cd /app
/venv/*/bin/python ./manage.py migrate
/venv/*/bin/gunicorn
