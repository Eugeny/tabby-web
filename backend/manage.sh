#!/bin/sh
if [[ -n "$DOCKERIZE_ARGS" ]]; then
    dockerize $DOCKERIZE_ARGS
fi
cd /app
/venv/*/bin/python ./manage.py $@
