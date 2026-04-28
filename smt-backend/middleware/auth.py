# middleware/auth.py  –  JWT helpers and FastAPI dependencies
import os
from datetime import datetime, timedelta, timezone
from typing import Literal

import jwt
from dotenv import load_dotenv
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

load_dotenv()

SECRET = os.getenv("JWT_SECRET", "change_me")
ALGO   = os.getenv("JWT_ALGORITHM", "HS256")
EXPIRE = int(os.getenv("JWT_EXPIRE_HOURS", "8"))

bearer = HTTPBearer()


def create_token(subject: str, role: Literal["admin", "employee"]) -> str:
    payload = {
        "sub":  subject,
        "role": role,
        "exp":  datetime.now(timezone.utc) + timedelta(hours=EXPIRE),
    }
    return jwt.encode(payload, SECRET, algorithm=ALGO)


def _decode(token: str) -> dict:
    try:
        return jwt.decode(token, SECRET, algorithms=[ALGO])
    except jwt.ExpiredSignatureError:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Token expired")
    except jwt.PyJWTError:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Invalid token")


def require_admin(creds: HTTPAuthorizationCredentials = Depends(bearer)) -> dict:
    payload = _decode(creds.credentials)
    if payload.get("role") != "admin":
        raise HTTPException(status.HTTP_403_FORBIDDEN, "Admin access required")
    return payload


def require_employee(creds: HTTPAuthorizationCredentials = Depends(bearer)) -> dict:
    payload = _decode(creds.credentials)
    if payload.get("role") not in ("employee", "admin"):
        raise HTTPException(status.HTTP_403_FORBIDDEN, "Employee access required")
    return payload
