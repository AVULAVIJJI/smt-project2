# db/seed_admin.py  –  Run once to create the default admin user
# Usage:  python db/seed_admin.py
import os, bcrypt
from dotenv import load_dotenv
from supabase import create_client

load_dotenv()

url = os.getenv("SUPABASE_URL")
key = os.getenv("SUPABASE_SERVICE_KEY")
username = os.getenv("ADMIN_USERNAME", "admin")
password = os.getenv("ADMIN_PASSWORD", "smt@2025")

sb = create_client(url, key)

# Check if admin already exists
existing = sb.table("smt_admins").select("id").eq("username", username).execute()
if existing.data:
    print(f"ℹ️  Admin '{username}' already exists — skipping seed")
else:
    hashed = bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()
    sb.table("smt_admins").insert({"username": username, "password_hash": hashed}).execute()
    print(f"✅  Admin '{username}' created successfully")
    print(f"    Password: {password}")
