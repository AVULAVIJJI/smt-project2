# routers/jobs.py
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel

from db.client import get_db
from middleware.auth import require_admin

router = APIRouter()


class JobIn(BaseModel):
    title: str
    dept: Optional[str] = None
    location: Optional[str] = None
    type: str = "Full-Time"
    experience: Optional[str] = None
    description: Optional[str] = None
    is_active: bool = True


# GET /api/jobs  – public active jobs
@router.get("/jobs")
async def list_public_jobs():
    db = get_db()
    res = db.table("smt_jobs") \
            .select("id,title,dept,location,type,experience,description,posted_at") \
            .eq("is_active", True) \
            .order("posted_at", desc=True) \
            .execute()
    return res.data


# GET /api/admin/jobs  – all jobs for admin
@router.get("/admin/jobs", dependencies=[Depends(require_admin)])
async def admin_list_jobs():
    db = get_db()
    res = db.table("smt_jobs") \
            .select("*") \
            .order("posted_at", desc=True) \
            .execute()
    return res.data


# POST /api/admin/jobs
@router.post("/admin/jobs", status_code=status.HTTP_201_CREATED, dependencies=[Depends(require_admin)])
async def create_job(body: JobIn):
    db = get_db()
    res = db.table("smt_jobs").insert(body.model_dump()).execute()
    return res.data[0]


# PUT /api/admin/jobs/{id}
@router.put("/admin/jobs/{job_id}", dependencies=[Depends(require_admin)])
async def update_job(job_id: int, body: JobIn):
    db = get_db()
    res = db.table("smt_jobs").update(body.model_dump()).eq("id", job_id).execute()
    if not res.data:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Job not found")
    return {"ok": True}


# DELETE /api/admin/jobs/{id}
@router.delete("/admin/jobs/{job_id}", dependencies=[Depends(require_admin)])
async def delete_job(job_id: int):
    db = get_db()
    res = db.table("smt_jobs").delete().eq("id", job_id).execute()
    if not res.data:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Job not found")
    return {"ok": True}


# PATCH /api/admin/jobs/{id}/toggle
@router.patch("/admin/jobs/{job_id}/toggle", dependencies=[Depends(require_admin)])
async def toggle_job(job_id: int):
    db = get_db()
    current = db.table("smt_jobs").select("is_active").eq("id", job_id).execute()
    if not current.data:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Job not found")
    new_val = not current.data[0]["is_active"]
    db.table("smt_jobs").update({"is_active": new_val}).eq("id", job_id).execute()
    return {"ok": True, "is_active": new_val}
