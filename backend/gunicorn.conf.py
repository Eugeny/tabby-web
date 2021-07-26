wsgi_app = "tabby.asgi:application"
workers = 4
worker_class = 'uvicorn.workers.UvicornWorker'
preload_app = True
sendfile = True

max_requests = 1000
max_requests_jitter = 100
