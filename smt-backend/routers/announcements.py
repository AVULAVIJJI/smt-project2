# routers/announcements.py  –  MongoDB-backed company announcements
from datetime import datetime, timezone
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from bson import ObjectId

from db.mongo_client import get_mongo
from middleware.auth import require_admin, require_employee

router = APIRouter()


def _fmt(doc) -> dict:
    doc["id"] = str(doc.pop("_id"))
    return doc


class AnnouncementIn(BaseModel):
    title: str
    body: str
    tag: Optional[str] = "General"
    pinned: bool = False


# GET /api/employee/announcements  – all active announcements
@router.get("/employee/announcements")
async def list_announcements(payload: dict = Depends(require_employee)):
    db = get_mongo()
    docs = list(db["announcements"].find({}).sort("created_at", -1).limit(50))
    return [_fmt(d) for d in docs]


# POST /api/admin/announcements  – admin creates announcement
@router.post("/admin/announcements", status_code=status.HTTP_201_CREATED,
             dependencies=[Depends(require_admin)])
async def create_announcement(body: AnnouncementIn):
    db = get_mongo()
    doc = {**body.model_dump(), "created_at": datetime.now(timezone.utc)}
    res = db["announcements"].insert_one(doc)
    doc["id"] = str(res.inserted_id)
    doc.pop("_id", None)
    return doc


# DELETE /api/admin/announcements/{id}
@router.delete("/admin/announcements/{ann_id}", dependencies=[Depends(require_admin)])
async def delete_announcement(ann_id: str):
    db = get_mongo()
    res = db["announcements"].delete_one({"_id": ObjectId(ann_id)})
    if res.deleted_count == 0:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Announcement not found")
    return {"ok": True}
