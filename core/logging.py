# core/logging.py
import logging
import uuid
import contextvars
from django.utils.deprecation import MiddlewareMixin

# Context vars survive across async contexts (safe for ASGI/gunicorn workers)
_request_id = contextvars.ContextVar("request_id", default=None)
_user = contextvars.ContextVar("user", default=None)
_path = contextvars.ContextVar("path", default=None)
_method = contextvars.ContextVar("method", default=None)

class RequestContextFilter(logging.Filter):
    """Inject request-scoped fields into each log record."""
    def filter(self, record: logging.LogRecord) -> bool:
        record.request_id = _request_id.get() or "-"
        record.user = _user.get() or "-"
        record.path = _path.get() or "-"
        record.method = _method.get() or "-"
        return True

class RequestContextMiddleware(MiddlewareMixin):
    def process_request(self, request):
        rid = request.headers.get("X-Request-ID") or str(uuid.uuid4())
        _request_id.set(rid)
        _path.set(getattr(request, "path", "-"))
        _method.set(getattr(request, "method", "-"))
        username = getattr(getattr(request, "user", None), "username", None)
        _user.set(username or "-")

    def process_response(self, request, response):
        # Update to final user (e.g., after login)
        username = getattr(getattr(request, "user", None), "username", None)
        _user.set(username or "-")

        rid = _request_id.get()
        if rid:
            response["X-Request-ID"] = rid

        # ⛔️ Do NOT clear the context here; Gunicorn logs after this.
        # _request_id.set(None); _user.set(None); _path.set(None); _method.set(None)
        return response