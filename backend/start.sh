#!/bin/sh
cd /app
./manage.py migrate
gunicorn
