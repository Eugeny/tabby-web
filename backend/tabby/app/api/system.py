"""
System endpoints for health checks, readiness, and version information.

These endpoints are useful for container orchestration (Kubernetes, Docker Compose)
and monitoring systems.
"""
import os
import time
from django.conf import settings
from django.db import connection
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny


# Track when the application started
_start_time = time.time()


class HealthCheckView(APIView):
    """
    Basic health check endpoint.

    Returns 200 if the application is running.
    This is a lightweight check suitable for load balancer health probes.

    GET /health
    """
    permission_classes = [AllowAny]
    authentication_classes = []  # No auth required

    def get(self, request, format=None):
        return Response({
            "status": "healthy",
            "timestamp": time.time(),
        })


class ReadinessCheckView(APIView):
    """
    Readiness check endpoint.

    Returns 200 if the application is ready to serve traffic.
    This checks database connectivity and other dependencies.

    GET /ready
    """
    permission_classes = [AllowAny]
    authentication_classes = []  # No auth required

    def get(self, request, format=None):
        checks = {
            "database": False,
        }

        # Check database connectivity
        try:
            with connection.cursor() as cursor:
                cursor.execute("SELECT 1")
                checks["database"] = True
        except Exception as e:
            checks["database"] = False
            checks["database_error"] = str(e)

        # Overall status
        all_healthy = all(v for k, v in checks.items() if not k.endswith("_error"))

        return Response(
            {
                "status": "ready" if all_healthy else "not_ready",
                "checks": checks,
                "timestamp": time.time(),
            },
            status=status.HTTP_200_OK if all_healthy else status.HTTP_503_SERVICE_UNAVAILABLE
        )


class LivenessCheckView(APIView):
    """
    Liveness check endpoint.

    Returns 200 if the application is alive and not stuck.
    This is used by orchestrators to determine if the container needs to be restarted.

    GET /live
    """
    permission_classes = [AllowAny]
    authentication_classes = []  # No auth required

    def get(self, request, format=None):
        uptime = time.time() - _start_time

        return Response({
            "status": "alive",
            "uptime_seconds": round(uptime, 2),
            "timestamp": time.time(),
        })


class VersionView(APIView):
    """
    Version information endpoint.

    Returns the current application version and build information.

    GET /api/1/version
    """
    permission_classes = [AllowAny]

    def get(self, request, format=None):
        # Try to get version from environment or package
        version = os.getenv("TABBY_VERSION", "unknown")
        git_commit = os.getenv("GIT_COMMIT", os.getenv("COMMIT_SHA", "unknown"))
        build_date = os.getenv("BUILD_DATE", "unknown")

        return Response({
            "version": version,
            "git_commit": git_commit[:8] if git_commit != "unknown" else "unknown",
            "build_date": build_date,
            "python_version": os.popen("python --version 2>&1").read().strip(),
            "debug": settings.DEBUG,
        })
