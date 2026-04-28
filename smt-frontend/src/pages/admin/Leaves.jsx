import React, { useState, useEffect } from 'react'
import { api } from '../../api'
import './Admin.css'

export default function Leaves() {
  const [leaves, setLeaves]   = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter]   = useState('all')

  const load = async () => {
    try { const d = await api.get('/admin/leaves'); setLeaves(d) }
    catch(e) { alert(e.message) }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const updateStatus = async (id, status) => {
    try { await api.patch(`/admin/leaves/${id}/status`, { status }); load() }
    catch(e) { alert(e.message) }
  }

  const filtered = filter === 'all' ? leaves : leaves.filter(l => l.status === filter)

  if (loading) return <div className="admin-page"><p>Loading...</p></div>

  return (
    <div className="admin-page">
      <div className="admin-page-head">
        <div><h1>Leaves</h1><p>Manage employee leave requests.</p></div>
      </div>
      <div className="admin-section">
        <div style={{display:'flex',gap:'8px',marginBottom:'16px'}}>
          {['all','Pending','Approved','Rejected'].map(s => (
            <button key={s} className={filter===s?'btn-admin-primary':'btn-admin-ghost'} onClick={() => setFilter(s)} style={{padding:'6px 14px',fontSize:'0.85rem'}}>
              {s === 'all' ? 'All' : s}
            </button>
          ))}
        </div>
        {filtered.length === 0 ? <div className="empty-state">No leave requests found.</div> : (
          <table className="admin-table">
            <thead><tr><th>Employee</th><th>Type</th><th>From</th><th>To</th><th>Days</th><th>Reason</th><th>Status</th><th>Action</th></tr></thead>
            <tbody>{filtered.map(l => (
              <tr key={l.id}>
                <td>{l.smt_employees?.name || l.employee_id}</td>
                <td>{l.leave_type}</td>
                <td>{l.from_date}</td>
                <td>{l.to_date}</td>
                <td>{l.days}</td>
                <td>{l.reason || '-'}</td>
                <td><span className={`status-badge status-${l.status==='Approved'?'active':l.status==='Rejected'?'rejected':'reviewing'}`}>{l.status}</span></td>
                <td className="table-actions">
                  {l.status === 'Pending' && <>
                    <button className="tbl-btn" onClick={() => updateStatus(l.id, 'Approved')}>Approve</button>
                    <button className="tbl-btn danger" onClick={() => updateStatus(l.id, 'Rejected')}>Reject</button>
                  </>}
                </td>
              </tr>
            ))}</tbody>
          </table>
        )}
      </div>
    </div>
  )
}