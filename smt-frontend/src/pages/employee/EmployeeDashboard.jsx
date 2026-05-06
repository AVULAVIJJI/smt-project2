import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../../api'
import './Employee.css'

function getGreeting() {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good Morning'
  if (hour < 17) return 'Good Afternoon'
  return 'Good Evening'
}

export default function EmployeeDashboard() {
  const emp = JSON.parse(localStorage.getItem('smt_employee') || '{}')
  const [stats, setStats] = useState(null)

  useEffect(() => {
    const today = new Date()
    const year  = today.getFullYear()
    const month = today.getMonth() + 1  // 1-indexed

    Promise.all([
      api.get('/employee/attendance'),   // [{date, status, year, month, check_in, check_out}, ...]
      api.get('/employee/leaves'),       // {leaves: [...], balance: [{type, total, used, remaining}]}
    ]).then(([attRecs, leaveData]) => {

      // ── Days Present this month ──────────────────────────────
      // backend already filters current month (year+month query)
      const daysPresent = attRecs.filter(r => r.status === 'present').length

      // ── Approved leave days this month ───────────────────────
      const approvedLeaves = (leaveData.leaves || []).filter(l => l.status === 'Approved')
      let leaveDaysThisMonth = 0
      approvedLeaves.forEach(l => {
        const from = new Date(l.from_date)
        const to   = new Date(l.to_date)
        for (let d = new Date(from); d <= to; d.setDate(d.getDate() + 1)) {
          if (d.getFullYear() === year && d.getMonth() + 1 === month) {
            leaveDaysThisMonth++
          }
        }
      })

      // ── Leaves Remaining (Annual Leave) ──────────────────────
      const annualBalance = (leaveData.balance || []).find(b => b.type === 'Annual Leave')
      const leavesRemaining = annualBalance ? annualBalance.remaining : 0

      // ── Working days so far this month (Mon–Fri only) ────────
      let workingDaysSoFar = 0
      for (let d = 1; d <= today.getDate(); d++) {
        const dow = new Date(year, month - 1, d).getDay()
        if (dow !== 0 && dow !== 6) workingDaysSoFar++
      }

      // ── Absent = working days − present − leave days ─────────
      const absentDays = Math.max(0, workingDaysSoFar - daysPresent - leaveDaysThisMonth)

      setStats({ daysPresent, leaveDaysThisMonth, leavesRemaining, absentDays })
    }).catch(() => {
      setStats({ daysPresent: 0, leaveDaysThisMonth: 0, leavesRemaining: 0, absentDays: 0 })
    })
  }, [])

  const loading = stats === null

  const cards = [
    { label: 'Days Present',     value: loading ? '...' : stats.daysPresent,        sub: 'This month',        icon: '✅' },
    { label: 'Leaves Remaining', value: loading ? '...' : stats.leavesRemaining,    sub: 'Annual leave left', icon: '📅' },
    { label: 'Leave Days Used',  value: loading ? '...' : stats.leaveDaysThisMonth, sub: 'This month',        icon: '🌴' },
    { label: 'Absent Days',      value: loading ? '...' : stats.absentDays,         sub: 'This month',        icon: '❌' },
  ]

  return (
    <div className="emp-page">
      <div className="emp-page-header">
        <div>
          <h1>{getGreeting()}, {emp.name || 'Employee'} 👋</h1>
          <p>Here's your overview for today — {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>
      </div>

      <div className="emp-stats-row">
        {cards.map(s => (
          <div className="emp-stat-card" key={s.label}>
            <div className="emp-stat-icon">{s.icon}</div>
            <div className="emp-stat-value">{s.value}</div>
            <div className="emp-stat-label">{s.label}</div>
            <div className="emp-stat-sub">{s.sub}</div>
          </div>
        ))}
      </div>

      <div className="emp-section">
        <h2>Quick Actions</h2>
        <div className="emp-quick-actions">
          <Link to="/employee/hr/leaves"        className="emp-action-btn">📅 Apply for Leave</Link>
          <Link to="/employee/my-data/payslips" className="emp-action-btn">💰 Download Pay Slip</Link>
          <Link to="/employee/my-data/profile"  className="emp-action-btn">👤 Update Profile</Link>
          <Link to="/employee/tasks"            className="emp-action-btn">✅ View Tasks</Link>
        </div>
      </div>

      <div className="emp-section">
        <h2>Company Announcements</h2>
        <AnnouncementsFeed />
      </div>
    </div>
  )
}

function AnnouncementsFeed() {
  const [list, setList] = useState(null)

  useEffect(() => {
    api.get('/employee/announcements')
      .then(d => setList(Array.isArray(d) ? d.slice(0, 3) : []))
      .catch(() => setList([]))
  }, [])

  if (!list) return <p>Loading...</p>
  if (list.length === 0) return <p>No announcements.</p>

  return (
    <div className="emp-announcements">
      {list.map((a, i) => (
        <div className="emp-announcement-card" key={a.id || i}>
          <div className="emp-ann-tag">{a.tag || a.category || 'General'}</div>
          <div className="emp-ann-title">{a.title}</div>
          <div className="emp-ann-date">{a.date || new Date(a.created_at).toLocaleDateString('en-IN')}</div>
        </div>
      ))}
    </div>
  )
}