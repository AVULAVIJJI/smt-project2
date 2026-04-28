-- =============================================================
--  SMT Supabase Schema
--  Paste this into Supabase → SQL Editor → Run
-- =============================================================

-- ── Admins ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS smt_admins (
    id            BIGSERIAL PRIMARY KEY,
    username      TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ── Employees ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS smt_employees (
    id            BIGSERIAL PRIMARY KEY,
    emp_id        TEXT NOT NULL UNIQUE,
    name          TEXT NOT NULL,
    role          TEXT,
    dept          TEXT,
    email         TEXT UNIQUE,
    phone         TEXT,
    join_date     DATE,
    salary        NUMERIC(12,2),
    status        TEXT DEFAULT 'Active',
    password_hash TEXT NOT NULL,
    created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ── Jobs ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS smt_jobs (
    id          BIGSERIAL PRIMARY KEY,
    title       TEXT NOT NULL,
    dept        TEXT,
    location    TEXT,
    type        TEXT DEFAULT 'Full-Time',
    experience  TEXT,
    description TEXT,
    is_active   BOOLEAN DEFAULT TRUE,
    posted_at   TIMESTAMPTZ DEFAULT NOW()
);

-- ── Applications ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS smt_applications (
    id          BIGSERIAL PRIMARY KEY,
    job_id      BIGINT REFERENCES smt_jobs(id) ON DELETE SET NULL,
    name        TEXT NOT NULL,
    email       TEXT NOT NULL,
    phone       TEXT,
    experience  TEXT,
    portfolio   TEXT,
    message     TEXT,
    role        TEXT,
    status      TEXT DEFAULT 'new',
    applied_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ── Contacts ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS smt_contacts (
    id           BIGSERIAL PRIMARY KEY,
    first_name   TEXT NOT NULL,
    last_name    TEXT,
    email        TEXT NOT NULL,
    service      TEXT,
    message      TEXT NOT NULL,
    submitted_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── Leaves ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS smt_leaves (
    id          BIGSERIAL PRIMARY KEY,
    employee_id BIGINT NOT NULL REFERENCES smt_employees(id) ON DELETE CASCADE,
    leave_type  TEXT NOT NULL,
    from_date   DATE NOT NULL,
    to_date     DATE NOT NULL,
    days        INTEGER NOT NULL,
    reason      TEXT,
    status      TEXT DEFAULT 'Pending',
    applied_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ── Tasks ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS smt_tasks (
    id          BIGSERIAL PRIMARY KEY,
    employee_id BIGINT NOT NULL REFERENCES smt_employees(id) ON DELETE CASCADE,
    title       TEXT NOT NULL,
    priority    TEXT DEFAULT 'Medium',
    due_date    DATE,
    status      TEXT DEFAULT 'Pending',
    created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ── Payslips ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS smt_payslips (
    id          BIGSERIAL PRIMARY KEY,
    employee_id BIGINT NOT NULL REFERENCES smt_employees(id) ON DELETE CASCADE,
    month_label TEXT NOT NULL,
    gross_pay   NUMERIC(12,2) NOT NULL,
    deductions  NUMERIC(12,2) DEFAULT 0,
    net_pay     NUMERIC(12,2) NOT NULL,
    status      TEXT DEFAULT 'Pending',
    created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ── Chat Logs ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS smt_chat_logs (
    id         BIGSERIAL PRIMARY KEY,
    session_id TEXT,
    message    TEXT NOT NULL,
    reply      TEXT,
    logged_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ── Indexes ───────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_applications_status ON smt_applications(status);
CREATE INDEX IF NOT EXISTS idx_leaves_employee     ON smt_leaves(employee_id);
CREATE INDEX IF NOT EXISTS idx_tasks_employee      ON smt_tasks(employee_id);
CREATE INDEX IF NOT EXISTS idx_payslips_employee   ON smt_payslips(employee_id);
CREATE INDEX IF NOT EXISTS idx_jobs_active         ON smt_jobs(is_active);
