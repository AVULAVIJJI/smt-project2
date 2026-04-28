import React, { useState, useEffect } from 'react'
import { api } from '../../api'
import './Admin.css'

const STATUS_OPTIONS = ['new','reviewing','shortlisted','rejected','hired']

export default function Applications() {
  const [apps,     setApps]   = useState([])
  const [filter,   setFilter] = useState('all')
  const [search,   setSearch] = useState('')
  const [selected, setSelect] = useState(null)
  const [loading,  setLoad]   = useState(true)

  useEffect(() => { loadApps() }, [])

  const loadApps = () => {
    setLoad(true)
    api.get('/admin/applications')
      .then(data => { setApps(data); setLoad(false) })
      .catch(() => setLoad(false))
  }

  const updateStatus = async (id, status) => {
    await api.patch(`/admin/applications/${id}/status`, { status }).catch(err => alert(err.message))
    loadApps()
    setSelect(null)
  }

  const deleteApp = async (id) => {
    if (!window.confirm('Delete this application?')) return
    await api.delete(`/admin/applications/${id}`).catch(err => alert(err.message))
    loadApps()
    setSelect(null)
  }

  const filtered = apps.filter(a => {
    const matchFilter = filter === 'all' || a.status === filter
    const matchSearch = a.name?.toLowerCase().includes(search.toLowerCase()) ||
                        a.role?.toLowerCase().includes(search.toLowerCase())
    return matchFilter && matchSearch
  })

  const sel = selected !== null ? apps.find(a => a.id === selected) : null

  return (
    <div className="admin-page">
      <div className="admin-page-head">
        <div><h1>Applications</h1><p>Review and manage all job applications.</p></div>
      </div>

      <div className="app-filters">
        <input className="admin-search" placeholder="Search by name or role..."
          value={search} onChange={e => setSearch(e.target.value)} />
        <div className="filter-group">
          {['all', ...STATUS_OPTIONS].map(s => (
            <button key={s} className={`filter-btn ${filter===s?'active':''}`} onClick={() => setFilter(s)}>
              {s.charAt(0).toUpperCase()+s.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="admin-section">
        {loading ? <div className="empty-state">Loading...</div> :
         filtered.length === 0 ? <div className="empty-state">No applications found.</div> : (
          <table className="admin-table">
            <thead><tr><th>Name</th><th>Role</th><th>Email</th><th>Phone</th><th>Applied</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {filtered.map(a => (
                <tr key={a.id} className={selected===a.id?'row-selected':''}>
                  <td><strong>{a.name}</strong></td>
                  <td>{a.role}</td><td>{a.email}</td><td>{a.phone}</td>
                  <td>{a.applied_at ? new Date(a.applied_at).toLocaleDateString() : '—'}</td>
                  <td>
                    <select className="status-select" value={a.status}
                      onChange={e => updateStatus(a.id, e.target.value)}>
                      {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </td>
                  <td className="table-actions">
                    <button className="tbl-btn" onClick={() => setSelect(selected===a.id?null:a.id)}>View</button>
                    <button className="tbl-btn danger" onClick={() => deleteApp(a.id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {sel && (
        <div className="detail-panel">
          <div className="detail-head">
            <h3>{sel.name}</h3>
            <button className="modal-x" onClick={() => setSelect(null)}>✕</button>
          </div>
          <div className="detail-grid">
            <div><span>Role</span><strong>{sel.role}</strong></div>
            <div><span>Email</span><strong>{sel.email}</strong></div>
            <div><span>Phone</span><strong>{sel.phone}</strong></div>
            <div><span>Experience</span><strong>{sel.experience||'—'}</strong></div>
            {sel.portfolio && <div><span>Portfolio</span><a href={sel.portfolio} target="_blank" rel="noreferrer">{sel.portfolio}</a></div>}
          </div>
          {sel.message && <div className="detail-message"><span>Message</span><p>{sel.message}</p></div>}
          <div className="detail-actions">
            <button className="btn-admin-primary" onClick={() => updateStatus(sel.id,'shortlisted')}>Shortlist</button>
            <button className="btn-hired" onClick={() => updateStatus(sel.id,'hired')}>Mark Hired</button>
            <button className="btn-reject" onClick={() => updateStatus(sel.id,'rejected')}>Reject</button>
          </div>
        </div>
      )}
    </div>
  )
}
