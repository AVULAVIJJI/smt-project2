import React, { useState, useEffect } from 'react'
import { api } from '../../api'
import './Employee.css'

const TAG_COLORS = {
  Holiday: 'badge-green',
  HR: 'badge-blue',
  Project: 'badge-purple',
  IT: 'badge-yellow',
  General: 'badge-gray',
}

export default function EmployeeAnnouncements() {
  const [items,   setItems]   = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/employee/announcements')
      .then(data => { setItems(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const fmt = iso => {
    if (!iso) return ''
    try { return new Date(iso).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' }) }
    catch { return iso }
  }

  return (
    <div className="emp-page">
      <div className="emp-page-header">
        <div><h1>📢 Announcements</h1><p>Latest updates from your company</p></div>
      </div>

      {loading ? (
        <div className="emp-section"><p>Loading announcements...</p></div>
      ) : items.length === 0 ? (
        <div className="emp-section emp-empty-state">
          <div className="emp-empty-icon">📭</div>
          <p>No announcements yet. Check back later!</p>
        </div>
      ) : (
        <div className="emp-announcements-list">
          {items.map(a => (
            <div className={`emp-ann-card-full ${a.pinned ? 'pinned' : ''}`} key={a.id}>
              <div className="emp-ann-card-header">
                <span className={`emp-badge ${TAG_COLORS[a.tag] || 'badge-gray'}`}>{a.tag}</span>
                {a.pinned && <span className="emp-pin-label">📌 Pinned</span>}
                <span className="emp-ann-date-sm">{fmt(a.created_at)}</span>
              </div>
              <div className="emp-ann-title-lg">{a.title}</div>
              <div className="emp-ann-body">{a.body}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
