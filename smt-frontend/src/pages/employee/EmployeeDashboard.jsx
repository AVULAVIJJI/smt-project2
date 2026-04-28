import React from 'react'
import { Link } from 'react-router-dom'
import './Employee.css'

const ANNOUNCEMENTS = [
  { id:1, title:'Office Holiday on April 14', date:'28 Mar 2026', tag:'Holiday' },
  { id:2, title:'Q1 Performance Reviews Start Next Week', date:'25 Mar 2026', tag:'HR' },
  { id:3, title:'New Project Kickoff: Client Portal v2', date:'20 Mar 2026', tag:'Project' },
]

export default function EmployeeDashboard() {
  const emp = JSON.parse(localStorage.getItem('smt_employee') || '{}')

  return (
    <div className="emp-page">
      <div className="emp-page-header">
        <div>
          <h1>Good Morning, {emp.name || 'Employee'} 👋</h1>
          <p>Here's your overview for today — {new Date().toLocaleDateString('en-IN', { weekday:'long', year:'numeric', month:'long', day:'numeric' })}</p>
        </div>
      </div>

      <div className="emp-stats-row">
        {[
          { label:'Days Present',      value:'18', sub:'This month',  icon:'✅' },
          { label:'Leaves Remaining',  value:'6',  sub:'Annual leave',icon:'📅' },
          { label:'Tasks Pending',     value:'3',  sub:'Due this week',icon:'⏳' },
          { label:'Team Members',      value:'12', sub:'Your team',   icon:'👥' },
        ].map(s => (
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
          <Link to="/employee/hr/leaves"      className="emp-action-btn">📅 Apply for Leave</Link>
          <Link to="/employee/my-data/payslips" className="emp-action-btn">💰 Download Pay Slip</Link>
          <Link to="/employee/my-data/profile"  className="emp-action-btn">👤 Update Profile</Link>
          <Link to="/employee/tasks"            className="emp-action-btn">✅ View Tasks</Link>
        </div>
      </div>

      <div className="emp-section">
        <h2>Company Announcements</h2>
        <div className="emp-announcements">
          {ANNOUNCEMENTS.map(a => (
            <div className="emp-announcement-card" key={a.id}>
              <div className="emp-ann-tag">{a.tag}</div>
              <div className="emp-ann-title">{a.title}</div>
              <div className="emp-ann-date">{a.date}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
