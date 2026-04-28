# routers/employees.py
import bcrypt
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, EmailStr

from db.client import get_db
from middleware.auth import require_admin, require_employee

router = APIRouter()


class EmployeeIn(BaseModel):
    emp_id: str
    name: str
    role: Optional[str] = None
    dept: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    join_date: Optional[str] = None
    salary: Optional[float] = None
    status: str = "Active"
    password: Optional[str] = "smt123"


class ProfileUpdate(BaseModel):
    name: Optional[str] = None
    role: Optional[str] = None
    dept: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    join_date: Optional[str] = None


# GET /api/admin/employees
@router.get("/admin/employees", dependencies=[Depends(require_admin)])
async def list_employees():
    db = get_db()
    res = db.table("smt_employees") \
            .select("id,emp_id,name,role,dept,email,phone,join_date,salary,status,created_at") \
            .order("created_at", desc=True) \
            .execute()
    return res.data


# POST /api/admin/employees
@router.post("/admin/employees", status_code=status.HTTP_201_CREATED, dependencies=[Depends(require_admin)])
async def create_employee(body: EmployeeIn):
    db = get_db()
    plain_pw = body.password or "smt123"

    # 1. Create in Supabase Auth (skip if already exists)
    try:
        db.auth.admin.create_user({
            "email": body.email,
            "password": plain_pw,
            "email_confirm": False
        })
    except Exception:
        pass  # Already exists in auth — continue anyway

    # 2. Hash password and insert into smt_employees
    password_hash = bcrypt.hashpw(plain_pw.encode(), bcrypt.gensalt()).decode()
    data = body.model_dump(exclude={"password"})
    data["password_hash"] = password_hash

    try:
        res = db.table("smt_employees").insert(data).execute()
        return res.data[0]
    except Exception as e:
        if "duplicate" in str(e).lower():
            raise HTTPException(status.HTTP_409_CONFLICT, "Employee ID or email already exists")
        raise


# PUT /api/admin/employees/{id}
@router.put("/admin/employees/{emp_id_pk}", dependencies=[Depends(require_admin)])
async def update_employee(emp_id_pk: int, body: EmployeeIn):
    db = get_db()
    plain_pw = body.password or "smt123"

    # Update Supabase Auth password too
    try:
        users = db.auth.admin.list_users()
        for user in users:
            if user.email == body.email:
                db.auth.admin.update_user_by_id(user.id, {"password": plain_pw})
                break
    except Exception:
        pass

    # Update password_hash in table
    password_hash = bcrypt.hashpw(plain_pw.encode(), bcrypt.gensalt()).decode()
    data = body.model_dump(exclude={"password"})
    data["password_hash"] = password_hash

    res = db.table("smt_employees").update(data).eq("id", emp_id_pk).execute()
    if not res.data:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Employee not found")
    return {"ok": True}


# DELETE /api/admin/employees/{id}
@router.delete("/admin/employees/{emp_id_pk}", dependencies=[Depends(require_admin)])
async def delete_employee(emp_id_pk: int):
    db = get_db()
    res = db.table("smt_employees").delete().eq("id", emp_id_pk).execute()
    if not res.data:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Employee not found")
    return {"ok": True}


# GET /api/employee/profile
@router.get("/employee/profile")
async def get_profile(payload: dict = Depends(require_employee)):
    emp_id = payload["sub"]
    db = get_db()
    res = db.table("smt_employees") \
            .select("id,emp_id,name,role,dept,email,phone,join_date,salary,status") \
            .eq("emp_id", emp_id) \
            .execute()
    if not res.data:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Employee not found")
    return res.data[0]


# PUT /api/employee/profile
@router.put("/employee/profile")
async def update_profile(body: ProfileUpdate, payload: dict = Depends(require_employee)):
    emp_id = payload["sub"]
    data = {k: v for k, v in body.model_dump().items() if v is not None}
    if not data:
        return {"ok": True, "message": "Nothing to update"}
    db = get_db()
    db.table("smt_employees").update(data).eq("emp_id", emp_id).execute()
    return {"ok": True}