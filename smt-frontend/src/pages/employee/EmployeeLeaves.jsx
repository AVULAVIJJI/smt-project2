import React, { useState, useEffect } from 'react'
import { api } from '../../api'
import './Employee.css'

const LEAVE_TYPES = ['Annual Leave','Sick Leave','Casual Leave','Work From Home']

export default function EmployeeLeaves() {
  const [data,     setData]  = useState({ leaves:[], balance:[] })
  const [showForm, setShow]  = useState(false)
  const [form,     setForm]  = useState({ leave_type: LEAVE_TYPES[0], from_date:'', to_date:'', reason:'' })
  const [success,  setSuc]   = useState(false)
  const [loading,  setLoad]  = useState(true)
  const [saving,   setSaving]= useState(false)

  useEffect(() => { loadLeaves() }, [])

  const loadLeaves = () => {
    setLoad(true)
    api.get('/employee/leaves')
      .then(d => { setData(d); setLoad(false) })
      .catch(() => setLoad(false))
  }

  const submit = async e => {
    e.preventDefault()
    if (!form.from_date || !form.to_date || !form.reason) return
    const from = new Date(form.from_date), to = new Date(form.to_date)
    const days = Math.max(1, Math.round((to - from) / 86400000) + 1)
    setSaving(true)
    try {
      await api.post('/employee/leaves', { ...form, days })
      setForm({ leave_type: LEAVE_TYPES[0], from_date:'', to_date:'', reason:'' })
      setShow(false); setSuc(true)
      setTimeout(() => setSuc(false), 3000)
      loadLeaves()
    } catch (err) { alert(err.message) }
    finally { setSaving(false) }
  }

  return (
    <div className="emp-page">
      <div className="emp-page-header">
        <div><h1>Leave Tracker</h1><p>Manage and apply for your leaves</p></div>
        <button className="emp-btn-primary" onClick={() => setShow(true)}>+ Apply for Leave</button>
      </div>

      {success && <div className="emp-success-banner">✅ Leave application submitted successfully!</div>}

      <div className="emp-stats-row">
        {loading ? <div className="emp-stat-card"><div className="emp-stat-label">Loading...</div></div> :
          data.balance.map(b => (
            <div className="emp-stat-card" key={b.type}>
              <div className="emp-stat-value">{b.remaining}</div>
              <div className="emp-stat-label">{b.type}</div>
              <div className="emp-stat-sub">{b.used} used of {b.total}</div>
            </div>
          ))
        }
      </div>

      <div className="emp-section">
        <h2>Leave History</h2>
        <div className="emp-table-wrap">
          <table className="emp-table">
            <thead><tr><th>Type</th><th>From</th><th>To</th><th>Days</th><th>Reason</th><th>Status</th></tr></thead>
            <tbody>
              {loading ? <tr><td colSpan="6">Loading...</td></tr> :
               data.leaves.length === 0 ? <tr><td colSpan="6">No leaves applied yet.</td></tr> :
               data.leaves.map(l => (
                <tr key={l.id}>
                  <td>{l.leave_type}</td>
                  <td>{l.from_date}</td><td>{l.to_date}</td><td>{l.days}</td><td>{l.reason}</td>
                  <td><span className={`emp-badge ${l.status==='Approved'?'badge-green':l.status==='Pending'?'badge-yellow':'badge-red'}`}>{l.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showForm && (
        <div className="emp-modal-overlay" onClick={() => setShow(false)}>
          <div className="emp-modal-box" onClick={e => e.stopPropagation()}>
            <div className="emp-modal-head">
              <h3>Apply for Leave</h3>
              <button className="emp-modal-x" onClick={() => setShow(false)}>✕</button>
            </div>
            <form className="emp-form" onSubmit={submit}>
              <div className="emp-field"><label>Leave Type</label>
                <select value={form.leave_type} onChange={e => setForm({...form, leave_type: e.target.value})}>
                  {LEAVE_TYPES.map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div className="emp-form-row">
                <div className="emp-field"><label>From Date</label>
                  <input type="date" value={form.from_date} onChange={e => setForm({...form, from_date: e.target.value})} required /></div>
                <div className="emp-field"><label>To Date</label>
                  <input type="date" value={form.to_date} onChange={e => setForm({...form, to_date: e.target.value})} required /></div>
              </div>
              <div className="emp-field"><label>Reason</label>
                <textarea rows="3" value={form.reason} onChange={e => setForm({...form, reason: e.target.value})} required /></div>
              <button type="submit" className="emp-btn-primary" style={{width:'100%'}} disabled={saving}>
                {saving ? 'Submitting...' : 'Submit Application'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
