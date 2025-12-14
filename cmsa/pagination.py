# cmsa/pagination.py

from rest_framework.pagination import PageNumberPagination


class OptionalPageNumberPagination(PageNumberPagination):
    """
    Backwards-compatible pagination:

    - If the request includes ?page= or ?page_size=, return a paginated response:
        { count, next, previous, results: [...] }

    - If not, return the legacy shape (a plain list) so existing frontend/tests keep working.
    """

    page_size = 25
    page_size_query_param = "page_size"
    max_page_size = 100

    def paginate_queryset(self, queryset, request, view=None):
        # Only paginate if the client explicitly asked for it.
        if "page" not in request.query_params and self.page_size_query_param not in request.query_params:
            return None
        return super().paginate_queryset(queryset, request, view=view)