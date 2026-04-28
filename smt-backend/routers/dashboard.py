# routers/dashboard.py
from fastapi import APIRouter, Depends
from middleware.auth import require_admin
from db.client import get_db

router = APIRouter()


# GET /api/admin/dashboard
@router.get("/admin/dashboard", dependencies=[Depends(require_admin)])
async def dashboard_stats():
    db = get_db()

    # Total active employees
    emp_res = db.table("smt_employees") \
                .select("id", count="exact") \
                .eq("status", "Active") \
                .execute()
    total_employees = emp_res.count or 0

    # Open jobs
    jobs_res = db.table("smt_jobs") \
                 .select("id", count="exact") \
                 .eq("is_active", True) \
                 .execute()
    open_jobs = jobs_res.count or 0

    # New applications
    apps_res = db.table("smt_applications") \
                 .select("id", count="exact") \
                 .eq("status", "new") \
                 .execute()
    new_applications = apps_res.count or 0

    # Total contacts
    contacts_res = db.table("smt_contacts") \
                     .select("id", count="exact") \
                     .execute()
    total_contacts = contacts_res.count or 0

    # Pending leaves
    leaves_res = db.table("smt_leaves") \
                   .select("id", count="exact") \
                   .eq("status", "Pending") \
                   .execute()
    pending_leaves = leaves_res.count or 0

    # Recent 5 applications
    recent_res = db.table("smt_applications") \
                   .select("name,role,email,applied_at,status") \
                   .order("applied_at", desc=True) \
                   .limit(5) \
                   .execute()

    return {
        "totalEmployees":     total_employees,
        "openJobs":           open_jobs,
        "newApplications":    new_applications,
        "totalContacts":      total_contacts,
        "pendingLeaves":      pending_leaves,
        "recentApplications": recent_res.data,
    }
