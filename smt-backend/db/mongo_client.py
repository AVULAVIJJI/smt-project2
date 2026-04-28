# db/mongo_client.py  –  MongoDB client singleton
# Used ONLY for: chatbot logs, attendance, announcements, it_helpdesk, reimbursement
# All core HR data (employees, leaves, payslips, tasks) stays on Supabase

import os
from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv()

_mongo_client: MongoClient | None = None


def get_mongo():
    """Return a pymongo Database object for smt_db."""
    global _mongo_client
    if _mongo_client is None:
        uri = os.getenv("MONGODB_URI", "")
        if not uri:
            raise RuntimeError("MONGODB_URI must be set in .env")
        _mongo_client = MongoClient(uri)
    db_name = os.getenv("MONGODB_DB", "smt_db")
    return _mongo_client[db_name]
