# core/request_logging.py

import time, logging
from django.utils.deprecation import MiddlewareMixin

req_logger = logging.getLogger("core.request")

class RequestLogMiddleware(MiddlewareMixin):
    def process_request(self, request):
        request._start_ts = time.time()

    def process_response(self, request, response):
        dur_ms = int((time.time() - getattr(request, "_start_ts", time.time())) * 1000)
        req_logger.info(
            "request complete",
            extra={
                "status": getattr(response, "status_code", 0),
                "duration_ms": dur_ms,
                "path": getattr(request, "path", "-"),
                "method": getattr(request, "method", "-"),
                "user": getattr(getattr(request, "user", None), "username", "-"),
            },
        )
        return response