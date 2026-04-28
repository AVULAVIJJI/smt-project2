"""
server.py  –  SMT Backend
Run:  uvicorn server:app --reload --port 8000
"""
import os
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routers import (
    auth, jobs, applications, employees, leaves, tasks,
    payslips, contacts, chatbot, dashboard,
    attendance, announcements, it_helpdesk, reimbursement,
)

load_dotenv()

app = FastAPI(
    title="SMT API",
    description="Soft Master Technology – Backend REST API",
    version="3.0.0",
)

# ── CORS ──────────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:4173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routers ───────────────────────────────────────────────────────────────────
PREFIX = "/api"

# Core (Supabase)
app.include_router(auth.router,          prefix=PREFIX, tags=["Auth"])
app.include_router(jobs.router,          prefix=PREFIX, tags=["Jobs"])
app.include_router(applications.router,  prefix=PREFIX, tags=["Applications"])
app.include_router(employees.router,     prefix=PREFIX, tags=["Employees"])
app.include_router(leaves.router,        prefix=PREFIX, tags=["Leaves"])
app.include_router(tasks.router,         prefix=PREFIX, tags=["Tasks"])
app.include_router(payslips.router,      prefix=PREFIX, tags=["Payslips"])
app.include_router(contacts.router,      prefix=PREFIX, tags=["Contacts"])
app.include_router(dashboard.router,     prefix=PREFIX, tags=["Dashboard"])

# Chatbot (MongoDB logs)
app.include_router(chatbot.router,       prefix=PREFIX, tags=["Chatbot"])

# New sections (MongoDB)
app.include_router(attendance.router,    prefix=PREFIX, tags=["Attendance"])
app.include_router(announcements.router, prefix=PREFIX, tags=["Announcements"])
app.include_router(it_helpdesk.router,   prefix=PREFIX, tags=["IT Helpdesk"])
app.include_router(reimbursement.router, prefix=PREFIX, tags=["Reimbursement"])

# ── Health check ──────────────────────────────────────────────────────────────
@app.get("/api/health", tags=["Health"])
async def health():
    return {"status": "ok", "service": "SMT API", "version": "3.0.0"}

@app.get("/api/mongo-test")
async def mongo_test():
    from db.mongo_client import get_mongo
    try:
        db = get_mongo()
        collections = db.list_collection_names()
        return {"status": "✅ Connected", "collections": collections}
    except Exception as e:
        return {"status": "❌ Error", "message": str(e)}

# ── Dev entry ─────────────────────────────────────────────────────────────────
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "server:app",
        host=os.getenv("HOST", "0.0.0.0"),
        port=int(os.getenv("PORT", 8000)),
        reload=True,
    )
