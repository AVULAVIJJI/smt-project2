# routers/applications.py
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, EmailStr

from db.client import get_db
from middleware.auth import require_admin

router = APIRouter()


class ApplicationIn(BaseModel):
    name: str
    email: EmailStr
    phone: Optional[str] = None
    experience: Optional[str] = None
    portfolio: Optional[str] = None
    message: Optional[str] = None
    role: Optional[str] = None
    job_id: Optional[int] = None


class StatusIn(BaseModel):
    status: str


# POST /api/applications  – public
@router.post("/applications", status_code=status.HTTP_201_CREATED)
async def submit_application(body: ApplicationIn):
    db = get_db()
    db.table("smt_applications").insert(body.model_dump()).execute()
    return {"ok": True, "message": "Application submitted successfully"}


# GET /api/admin/applications
@router.get("/admin/applications", dependencies=[Depends(require_admin)])
async def list_applications():
    db = get_db()
    res = db.table("smt_applications").select("*").order("applied_at", desc=True).execute()
    return res.data


# PATCH /api/admin/applications/{id}/status
@router.patch("/admin/applications/{app_id}/status", dependencies=[Depends(require_admin)])
async def update_status(app_id: int, body: StatusIn):
    valid = {"new", "reviewing", "shortlisted", "rejected", "hired"}
    if body.status not in valid:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, f"status must be one of {valid}")
    db = get_db()
    res = db.table("smt_applications").update({"status": body.status}).eq("id", app_id).execute()
    if not res.data:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Application not found")
    return {"ok": True}


# DELETE /api/admin/applications/{id}
@router.delete("/admin/applications/{app_id}", dependencies=[Depends(require_admin)])
async def delete_application(app_id: int):
    db = get_db()
    res = db.table("smt_applications").delete().eq("id", app_id).execute()
    if not res.data:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Application not found")
    return {"ok": True}
