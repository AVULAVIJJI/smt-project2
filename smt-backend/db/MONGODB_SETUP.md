# MongoDB Setup Guide (for new sections)

MongoDB is used ONLY for:
- **Chatbot logs** (`chat_logs`)
- **Attendance** (`attendance`)
- **Announcements** (`announcements`)
- **IT Helpdesk** (`it_helpdesk`)
- **Reimbursements** (`reimbursements`)

Everything else (employees, leaves, payslips, tasks, jobs) stays on **Supabase**.

---

## Step 1 – Create a free MongoDB Atlas cluster

1. Go to https://cloud.mongodb.com → Sign up / Log in
2. Click **Build a Database** → choose **M0 Free**
3. Select a cloud region (e.g. AWS / ap-south-1 for India)
4. Create a username & password — **save these**
5. Under **Network Access** → Add IP Address → Allow from anywhere (`0.0.0.0/0`) for dev

---

## Step 2 – Get your connection string

1. In Atlas, click **Connect** → **Drivers**
2. Select **Python / 3.12 or later**
3. Copy the URI — looks like:
   ```
   mongodb+srv://myuser:mypassword@cluster0.abc12.mongodb.net/?retryWrites=true&w=majority
   ```

---

## Step 3 – Put it in your .env

Open `smt-backend/.env` and set:

```
MONGODB_URI=mongodb+srv://myuser:mypassword@cluster0.abc12.mongodb.net/?retryWrites=true&w=majority
MONGODB_DB=smt_db
```

---

## Step 4 – Collections are created automatically

No SQL to run. When the backend first writes to MongoDB, the collections are created automatically:

| Collection      | Created by          |
|----------------|---------------------|
| `chat_logs`     | First chatbot message |
| `attendance`    | First check-in      |
| `announcements` | Admin creates one   |
| `it_helpdesk`   | First ticket        |
| `reimbursements`| First claim         |

---

## Step 5 – Seed an announcement (optional)

In Atlas → **Browse Collections** → `smt_db` → `announcements` → **Insert Document**:

```json
{
  "title": "Welcome to SMT Employee Portal!",
  "body": "We are excited to launch the new employee portal. Explore all sections.",
  "tag": "General",
  "pinned": true,
  "created_at": { "$date": "2026-04-04T00:00:00Z" }
}
```
