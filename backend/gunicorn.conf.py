wsgi_app = "tabby.wsgi:application"
workers = 4
preload_app = True
sendfile = True

max_requests = 1000
max_requests_jitter = 100
