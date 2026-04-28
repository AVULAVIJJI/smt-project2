import React, { useState, useEffect } from 'react'
import { api } from '../../api'
import './Admin.css'

export default function Tasks() {
  const [tasks, setTasks]     = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter]   = useState('all')

  const load = async () => {
    try { const d = await api.get('/admin/tasks'); setTasks(d) }
    catch(e) { alert(e.message) }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const filtered = filter === 'all' ? tasks : tasks.filter(t => t.status === filter)

  if (loading) return <div className="admin-page"><p>Loading...</p></div>

  return (
    <div className="admin-page">
      <div className="admin-page-head">
        <div><h1>Tasks</h1><p>View all employee tasks.</p></div>
      </div>
      <div className="admin-section">
        <div style={{display:'flex',gap:'8px',marginBottom:'16px'}}>
          {['all','Pending','In Progress','Done'].map(s => (
            <button key={s} className={filter===s?'btn-admin-primary':'btn-admin-ghost'} onClick={() => setFilter(s)} style={{padding:'6px 14px',fontSize:'0.85rem'}}>
              {s === 'all' ? 'All' : s}
            </button>
          ))}
        </div>
        {filtered.length === 0 ? <div className="empty-state">No tasks found.</div> : (
          <table className="admin-table">
            <thead><tr><th>Employee</th><th>Task</th><th>Priority</th><th>Due Date</th><th>Status</th></tr></thead>
            <tbody>{filtered.map(t => (
              <tr key={t.id}>
                <td>{t.smt_employees?.name || t.employee_id}</td>
                <td>{t.title}</td>
                <td><span style={{color: t.priority==='High'?'#f44336':t.priority==='Medium'?'#ffc107':'#4caf50'}}>{t.priority}</span></td>
                <td>{t.due_date || '-'}</td>
                <td><span className={`status-badge status-${t.status==='Done'?'active':t.status==='In Progress'?'reviewing':'rejected'}`}>{t.status}</span></td>
              </tr>
            ))}</tbody>
          </table>
        )}
      </div>
    </div>
  )
}