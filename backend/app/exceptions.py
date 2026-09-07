"""Domain-level exceptions, translated to HTTP responses in main.py.

Keeping these separate from FastAPI's HTTPException means the service and
repository layers stay framework-agnostic — they raise plain Python
exceptions, and only main.py knows these map to specific status codes.
"""


class NotFoundError(Exception):
    def __init__(self, resource: str, resource_id: int):
        self.resource = resource
        self.resource_id = resource_id
        super().__init__(f"{resource} {resource_id} not found")


class InvalidInputError(Exception):
    """Raised for semantically invalid input that passes Pydantic's schema
    validation but violates a data-integrity rule (e.g. an assignee_id that
    doesn't reference an existing participant).
    """

    def __init__(self, message: str):
        self.message = message
        super().__init__(message)
