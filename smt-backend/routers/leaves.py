# routers/leaves.py
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel

from db.client import get_db
from middleware.auth import require_admin, require_employee

router = APIRouter()

LEAVE_BALANCE = {"Annual Leave": 12, "Sick Leave": 6, "Casual Leave": 6}


class LeaveIn(BaseModel):
    leave_type: str
    from_date: str
    to_date: str
    days: int
    reason: Optional[str] = None


class StatusIn(BaseModel):
    status: str


def _get_emp_pk(db, emp_id: str) -> int:
    res = db.table("smt_employees").select("id").eq("emp_id", emp_id).execute()
    if not res.data:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Employee not found")
    return res.data[0]["id"]


# GET /api/employee/leaves
@router.get("/employee/leaves")
async def get_leaves(payload: dict = Depends(require_employee)):
    db = get_db()
    pk = _get_emp_pk(db, payload["sub"])

    leaves_res = db.table("smt_leaves") \
                   .select("*") \
                   .eq("employee_id", pk) \
                   .order("applied_at", desc=True) \
                   .execute()

    # Calculate used per type
    used_map: dict = {}
    for lv in leaves_res.data:
        if lv["status"] == "Approved":
            used_map[lv["leave_type"]] = used_map.get(lv["leave_type"], 0) + lv["days"]

    balance = [
        {"type": t, "total": total, "used": used_map.get(t, 0),
         "remaining": total - used_map.get(t, 0)}
        for t, total in LEAVE_BALANCE.items()
    ]
    return {"leaves": leaves_res.data, "balance": balance}


# POST /api/employee/leaves
@router.post("/employee/leaves", status_code=status.HTTP_201_CREATED)
async def apply_leave(body: LeaveIn, payload: dict = Depends(require_employee)):
    db = get_db()
    pk = _get_emp_pk(db, payload["sub"])
    data = body.model_dump()
    data["employee_id"] = pk
    db.table("smt_leaves").insert(data).execute()
    return {"ok": True}


# GET /api/admin/leaves
@router.get("/admin/leaves", dependencies=[Depends(require_admin)])
async def admin_list_leaves():
    db = get_db()
    res = db.table("smt_leaves") \
            .select("*, smt_employees(emp_id, name)") \
            .order("applied_at", desc=True) \
            .execute()
    return res.data


# PATCH /api/admin/leaves/{id}/status
@router.patch("/admin/leaves/{leave_id}/status", dependencies=[Depends(require_admin)])
async def update_leave_status(leave_id: int, body: StatusIn):
    if body.status not in {"Approved", "Rejected", "Pending"}:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Invalid status")
    db = get_db()
    res = db.table("smt_leaves").update({"status": body.status}).eq("id", leave_id).execute()
    if not res.data:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Leave not found")
    return {"ok": True}
