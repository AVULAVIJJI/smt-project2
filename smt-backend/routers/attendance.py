# routers/attendance.py  –  MongoDB-backed attendance records
from datetime import datetime, date, timezone
from typing import Optional
from fastapi import APIRouter, Depends
from pydantic import BaseModel

from db.mongo_client import get_mongo
from middleware.auth import require_employee

router = APIRouter()


class CheckInOut(BaseModel):
    action: str   # "check_in" | "check_out"
    note: Optional[str] = None


# GET /api/employee/attendance  – list this month's records
@router.get("/employee/attendance")
async def get_attendance(payload: dict = Depends(require_employee)):
    emp_id = payload["sub"]
    db = get_mongo()
    today = date.today()
    records = list(
        db["attendance"].find(
            {"emp_id": emp_id, "year": today.year, "month": today.month},
            {"_id": 0}
        ).sort("date", -1)
    )
    return records


# GET /api/employee/attendance/today  – today's status
@router.get("/employee/attendance/today")
async def get_today(payload: dict = Depends(require_employee)):
    emp_id = payload["sub"]
    today_str = date.today().isoformat()
    db = get_mongo()
    rec = db["attendance"].find_one({"emp_id": emp_id, "date": today_str}, {"_id": 0})
    return rec or {"date": today_str, "status": "absent", "check_in": None, "check_out": None}


# POST /api/employee/attendance/action  – check-in or check-out
@router.post("/employee/attendance/action")
async def attendance_action(body: CheckInOut, payload: dict = Depends(require_employee)):
    emp_id = payload["sub"]
    today_str = date.today().isoformat()
    now_str = datetime.now(timezone.utc).strftime("%H:%M")
    db = get_mongo()
    col = db["attendance"]

    existing = col.find_one({"emp_id": emp_id, "date": today_str})

    if body.action == "check_in":
        if existing and existing.get("check_in"):
            return {"ok": False, "message": "Already checked in today"}
        if existing:
            col.update_one({"_id": existing["_id"]}, {"$set": {"check_in": now_str, "status": "present"}})
        else:
            today = date.today()
            col.insert_one({
                "emp_id": emp_id, "date": today_str,
                "year": today.year, "month": today.month,
                "check_in": now_str, "check_out": None,
                "status": "present", "note": body.note or ""
            })
        return {"ok": True, "action": "check_in", "time": now_str}

    elif body.action == "check_out":
        if not existing or not existing.get("check_in"):
            return {"ok": False, "message": "Please check in first"}
        if existing.get("check_out"):
            return {"ok": False, "message": "Already checked out today"}
        # Calculate hours
        try:
            ci = datetime.strptime(existing["check_in"], "%H:%M")
            co = datetime.strptime(now_str, "%H:%M")
            hours = round((co - ci).seconds / 3600, 2)
        except Exception:
            hours = 0
        col.update_one({"_id": existing["_id"]}, {"$set": {"check_out": now_str, "hours": hours}})
        return {"ok": True, "action": "check_out", "time": now_str, "hours": hours}

    return {"ok": False, "message": "Invalid action"}
