# routers/contacts.py
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, EmailStr

from db.client import get_db
from middleware.auth import require_admin

router = APIRouter()


class ContactIn(BaseModel):
    first_name: str
    last_name: Optional[str] = None
    email: EmailStr
    service: Optional[str] = None
    message: str


# POST /api/contact  – public
@router.post("/contact", status_code=status.HTTP_201_CREATED)
async def submit_contact(body: ContactIn):
    db = get_db()
    db.table("smt_contacts").insert(body.model_dump()).execute()
    return {
        "ok": True,
        "success": True,
        "message": "Message received! We'll get back to you within 24 hours."
    }


# GET /api/admin/contacts
@router.get("/admin/contacts", dependencies=[Depends(require_admin)])
async def list_contacts():
    db = get_db()
    res = db.table("smt_contacts") \
            .select("*") \
            .order("submitted_at", desc=True) \
            .execute()
    return res.data


# DELETE /api/admin/contacts/{id}
@router.delete("/admin/contacts/{contact_id}", dependencies=[Depends(require_admin)])
async def delete_contact(contact_id: int):
    db = get_db()
    res = db.table("smt_contacts").delete().eq("id", contact_id).execute()
    if not res.data:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Contact not found")
    return {"ok": True}
