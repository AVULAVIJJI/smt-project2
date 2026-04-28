# routers/auth.py
import bcrypt
import secrets
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel

from db.client import get_db
from middleware.auth import create_token

router = APIRouter()


class AdminLoginIn(BaseModel):
    username: str
    password: str


class EmployeeLoginIn(BaseModel):
    email: str
    password: str


class ForgotPasswordIn(BaseModel):
    emp_id: str
    email: str


class ResetPasswordIn(BaseModel):
    emp_id: str
    email: str
    new_password: str


def _check_pw(plain: str, hashed: str) -> bool:
    return bcrypt.checkpw(plain.encode(), hashed.encode())


# POST /api/admin/login
@router.post("/admin/login")
async def admin_login(body: AdminLoginIn):
    db = get_db()
    res = db.table("smt_admins").select("id,username,password_hash").eq("username", body.username).execute()
    row = res.data[0] if res.data else None
    if not row or not _check_pw(body.password, row["password_hash"]):
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Invalid username or password")
    token = create_token(subject=body.username, role="admin")
    return {"token": token, "role": "admin", "username": body.username}


# POST /api/employee/login  (email + password)
@router.post("/employee/login")
async def employee_login(body: EmployeeLoginIn):
    db = get_db()
    res = db.table("smt_employees") \
            .select("id,name,emp_id,role,dept,email,password_hash") \
            .eq("email", body.email.strip().lower()) \
            .neq("status", "Resigned") \
            .execute()
    row = res.data[0] if res.data else None
    if not row or not _check_pw(body.password, row["password_hash"]):
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Invalid email or password")
    token = create_token(subject=row["emp_id"], role="employee")
    emp = {k: row[k] for k in ["id", "name", "emp_id", "role", "dept", "email"]}
    emp["empId"] = emp.pop("emp_id")
    return {"token": token, "role": "employee", "employee": emp}


# POST /api/employee/forgot-password
@router.post("/employee/forgot-password")
async def forgot_password(body: ForgotPasswordIn):
    db = get_db()
    res = db.table("smt_employees") \
            .select("id,emp_id,email") \
            .eq("emp_id", body.emp_id.strip()) \
            .neq("status", "Resigned") \
            .execute()
    row = res.data[0] if res.data else None
    if not row or row["email"].lower() != body.email.strip().lower():
        raise HTTPException(
            status.HTTP_404_NOT_FOUND,
            "No active employee found with that Employee ID and email combination."
        )
    temp_pw = "SMT@" + secrets.token_hex(3).upper()
    hashed = bcrypt.hashpw(temp_pw.encode(), bcrypt.gensalt()).decode()
    db.table("smt_employees").update({"password_hash": hashed}).eq("id", row["id"]).execute()
    return {
        "ok": True,
        "message": "Password reset successful. Use the temporary password below to log in.",
        "temp_password": temp_pw,
    }


# POST /api/employee/change-password
@router.post("/employee/change-password")
async def change_password(body: ResetPasswordIn):
    db = get_db()
    res = db.table("smt_employees") \
            .select("id,email") \
            .eq("emp_id", body.emp_id.strip()) \
            .neq("status", "Resigned") \
            .execute()
    row = res.data[0] if res.data else None
    if not row or row["email"].lower() != body.email.strip().lower():
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Employee not found")
    if len(body.new_password) < 6:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Password must be at least 6 characters")
    hashed = bcrypt.hashpw(body.new_password.encode(), bcrypt.gensalt()).decode()
    db.table("smt_employees").update({"password_hash": hashed}).eq("id", row["id"]).execute()
    return {"ok": True, "message": "Password changed successfully."}