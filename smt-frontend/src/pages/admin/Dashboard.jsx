import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../../api'
import './Admin.css'

export default function Dashboard() {
  const [stats, setStats] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    api.get('/admin/dashboard')
      .then(setStats)
      .catch(err => setError(err.message))
  }, [])

  if (error) return <div className="admin-page"><div className="empty-state">Error: {error}</div></div>
  if (!stats) return <div className="admin-page"><div className="empty-state">Loading...</div></div>

  const cards = [
    { label: 'Total Employees',   value: stats.totalEmployees,   icon: '👥', color: 'blue'   },
    { label: 'Open Jobs',         value: stats.openJobs,         icon: '📋', color: 'cyan'   },
    { label: 'New Applications',  value: stats.newApplications,  icon: '📩', color: 'amber'  },
    { label: 'Contact Enquiries', value: stats.totalContacts,    icon: '✉️', color: 'purple' },
  ]

  return (
    <div className="admin-page">
      <div className="admin-page-head">
        <h1>Dashboard</h1>
        <p>Welcome back! Here's what's happening at Soft Master Technology.</p>
      </div>

      <div className="dash-cards">
        {cards.map(c => (
          <div className={`dash-card dash-card-${c.color}`} key={c.label}>
            <div className="dash-card-icon">{c.icon}</div>
            <div className="dash-card-val">{c.value}</div>
            <div className="dash-card-lbl">{c.label}</div>
          </div>
        ))}
      </div>

      <div className="admin-section">
        <h2>Recent Applications</h2>
        {stats.recentApplications?.length === 0 ? (
          <div className="empty-state">No applications yet.</div>
        ) : (
          <table className="admin-table">
            <thead><tr><th>Name</th><th>Role</th><th>Email</th><th>Applied</th><th>Status</th></tr></thead>
            <tbody>
              {stats.recentApplications?.map((a, i) => (
                <tr key={i}>
                  <td>{a.name}</td><td>{a.role}</td><td>{a.email}</td>
                  <td>{new Date(a.applied_at).toLocaleDateString()}</td>
                  <td><span className={`status-badge status-${a.status}`}>{a.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="admin-section">
        <h2>Quick Actions</h2>
        <div className="quick-actions">
          <Link to="/admin/jobs"         className="qa-card">📋 Post a New Job</Link>
          <Link to="/admin/applications" className="qa-card">📩 Review Applications</Link>
          <Link to="/admin/employees"    className="qa-card">👥 Add Employee</Link>
          <a href="/careers" target="_blank" rel="noreferrer" className="qa-card">🔗 View Careers Page</a>
        </div>
      </div>
    </div>
  )
}
