# routers/it_helpdesk.py  –  MongoDB-backed IT helpdesk tickets
from datetime import datetime, timezone
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from bson import ObjectId

from db.mongo_client import get_mongo
from middleware.auth import require_employee, require_admin

router = APIRouter()

CATEGORIES = ["Hardware", "Software", "Network", "Access", "Other"]
PRIORITIES  = ["Low", "Medium", "High", "Critical"]


def _fmt(doc) -> dict:
    doc["id"] = str(doc.pop("_id"))
    return doc


class TicketIn(BaseModel):
    subject: str
    category: str = "Other"
    priority: str = "Medium"
    description: str


class StatusUpdate(BaseModel):
    status: str   # Open | In Progress | Resolved | Closed
    admin_note: Optional[str] = None


# GET /api/employee/it-helpdesk  – employee's own tickets
@router.get("/employee/it-helpdesk")
async def my_tickets(payload: dict = Depends(require_employee)):
    emp_id = payload["sub"]
    db = get_mongo()
    docs = list(db["it_helpdesk"].find({"emp_id": emp_id}).sort("created_at", -1))
    return [_fmt(d) for d in docs]


# POST /api/employee/it-helpdesk  – raise a ticket
@router.post("/employee/it-helpdesk", status_code=status.HTTP_201_CREATED)
async def raise_ticket(body: TicketIn, payload: dict = Depends(require_employee)):
    emp_id = payload["sub"]
    db = get_mongo()
    doc = {
        **body.model_dump(),
        "emp_id": emp_id,
        "status": "Open",
        "admin_note": "",
        "created_at": datetime.now(timezone.utc),
    }
    res = db["it_helpdesk"].insert_one(doc)
    doc["id"] = str(res.inserted_id)
    doc.pop("_id", None)
    return doc


# GET /api/admin/it-helpdesk  – admin sees all tickets
@router.get("/admin/it-helpdesk", dependencies=[Depends(require_admin)])
async def all_tickets():
    db = get_mongo()
    docs = list(db["it_helpdesk"].find({}).sort("created_at", -1))
    return [_fmt(d) for d in docs]


# PATCH /api/admin/it-helpdesk/{id}/status
@router.patch("/admin/it-helpdesk/{ticket_id}/status", dependencies=[Depends(require_admin)])
async def update_ticket(ticket_id: str, body: StatusUpdate):
    allowed = {"Open", "In Progress", "Resolved", "Closed"}
    if body.status not in allowed:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, f"status must be one of {allowed}")
    db = get_mongo()
    upd = {"status": body.status}
    if body.admin_note:
        upd["admin_note"] = body.admin_note
    res = db["it_helpdesk"].update_one({"_id": ObjectId(ticket_id)}, {"$set": upd})
    if res.matched_count == 0:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Ticket not found")
    return {"ok": True}
