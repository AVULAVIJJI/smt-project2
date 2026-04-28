# routers/tasks.py
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel

from db.client import get_db
from middleware.auth import require_admin, require_employee

router = APIRouter()


class TaskIn(BaseModel):
    title: str
    priority: str = "Medium"
    due_date: Optional[str] = None
    status: str = "Pending"


class StatusIn(BaseModel):
    status: str


def _get_emp_pk(db, emp_id: str) -> int:
    res = db.table("smt_employees").select("id").eq("emp_id", emp_id).execute()
    if not res.data:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Employee not found")
    return res.data[0]["id"]


# GET /api/employee/tasks
@router.get("/employee/tasks")
async def get_tasks(payload: dict = Depends(require_employee)):
    db = get_db()
    pk = _get_emp_pk(db, payload["sub"])
    res = db.table("smt_tasks") \
            .select("*") \
            .eq("employee_id", pk) \
            .order("created_at", desc=True) \
            .execute()
    return res.data


# POST /api/employee/tasks
@router.post("/employee/tasks", status_code=status.HTTP_201_CREATED)
async def add_task(body: TaskIn, payload: dict = Depends(require_employee)):
    db = get_db()
    pk = _get_emp_pk(db, payload["sub"])
    data = body.model_dump()
    data["employee_id"] = pk
    res = db.table("smt_tasks").insert(data).execute()
    return res.data[0]


# PATCH /api/employee/tasks/{id}/status
@router.patch("/employee/tasks/{task_id}/status")
async def update_task_status(task_id: int, body: StatusIn, payload: dict = Depends(require_employee)):
    valid = {"Pending", "In Progress", "Done"}
    if body.status not in valid:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, f"status must be one of {valid}")
    db = get_db()
    pk = _get_emp_pk(db, payload["sub"])
    res = db.table("smt_tasks").update({"status": body.status}).eq("id", task_id).eq("employee_id", pk).execute()
    if not res.data:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Task not found")
    return {"ok": True}


# DELETE /api/employee/tasks/{id}
@router.delete("/employee/tasks/{task_id}")
async def delete_task(task_id: int, payload: dict = Depends(require_employee)):
    db = get_db()
    pk = _get_emp_pk(db, payload["sub"])
    res = db.table("smt_tasks").delete().eq("id", task_id).eq("employee_id", pk).execute()
    if not res.data:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Task not found")
    return {"ok": True}


# GET /api/admin/tasks
@router.get("/admin/tasks", dependencies=[Depends(require_admin)])
async def admin_list_tasks():
    db = get_db()
    res = db.table("smt_tasks") \
            .select("*, smt_employees(emp_id, name)") \
            .order("created_at", desc=True) \
            .execute()
    return res.data
