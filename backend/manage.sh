#!/bin/sh
/wait # Error starting command: `"-wait` - exec: "\"-wait": executable file not found in $PATH
cd /app
/venv/*/bin/python ./manage.py $@
