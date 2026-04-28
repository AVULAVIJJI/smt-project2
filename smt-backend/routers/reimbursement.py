# routers/reimbursement.py  –  MongoDB-backed expense reimbursements
from datetime import datetime, timezone
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from bson import ObjectId

from db.mongo_client import get_mongo
from middleware.auth import require_employee, require_admin

router = APIRouter()


def _fmt(doc) -> dict:
    doc["id"] = str(doc.pop("_id"))
    return doc


class ReimbursementIn(BaseModel):
    category: str          # Travel | Food | Equipment | Other
    amount: float
    expense_date: str      # YYYY-MM-DD
    description: str
    bill_ref: Optional[str] = None


class StatusUpdate(BaseModel):
    status: str            # Approved | Rejected
    admin_note: Optional[str] = None


# GET /api/employee/reimbursements
@router.get("/employee/reimbursements")
async def my_reimbursements(payload: dict = Depends(require_employee)):
    emp_id = payload["sub"]
    db = get_mongo()
    docs = list(db["reimbursements"].find({"emp_id": emp_id}).sort("created_at", -1))
    return [_fmt(d) for d in docs]


# POST /api/employee/reimbursements
@router.post("/employee/reimbursements", status_code=status.HTTP_201_CREATED)
async def submit_reimbursement(body: ReimbursementIn, payload: dict = Depends(require_employee)):
    emp_id = payload["sub"]
    db = get_mongo()
    doc = {
        **body.model_dump(),
        "emp_id": emp_id,
        "status": "Pending",
        "admin_note": "",
        "created_at": datetime.now(timezone.utc),
    }
    res = db["reimbursements"].insert_one(doc)
    doc["id"] = str(res.inserted_id)
    doc.pop("_id", None)
    return doc


# GET /api/admin/reimbursements
@router.get("/admin/reimbursements", dependencies=[Depends(require_admin)])
async def all_reimbursements():
    db = get_mongo()
    docs = list(db["reimbursements"].find({}).sort("created_at", -1))
    return [_fmt(d) for d in docs]


# PATCH /api/admin/reimbursements/{id}/status
@router.patch("/admin/reimbursements/{reimb_id}/status", dependencies=[Depends(require_admin)])
async def update_status(reimb_id: str, body: StatusUpdate):
    if body.status not in {"Approved", "Rejected"}:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "status must be Approved or Rejected")
    db = get_mongo()
    upd = {"status": body.status}
    if body.admin_note:
        upd["admin_note"] = body.admin_note
    res = db["reimbursements"].update_one({"_id": ObjectId(reimb_id)}, {"$set": upd})
    if res.matched_count == 0:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Reimbursement not found")
    return {"ok": True}
