#!/bin/sh
/wait
cd /app
/venv/*/bin/python ./manage.py $@
