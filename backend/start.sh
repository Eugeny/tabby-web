#!/bin/sh
./manage.py migrate
gunicorn
