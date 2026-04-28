# utils/responses.py
from fastapi.responses import JSONResponse
from typing import Any


def ok(data: Any = None, message: str = "Success", status_code: int = 200):
    body = {"ok": True, "message": message}
    if data is not None:
        body["data"] = data
    return JSONResponse(content=body, status_code=status_code)


def error(message: str, status_code: int = 400):
    return JSONResponse(
        content={"ok": False, "message": message},
        status_code=status_code,
    )
