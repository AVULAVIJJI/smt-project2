import React, { useState, useEffect } from 'react'
import { api } from '../../api'
import './Employee.css'

const CATEGORIES = ['Hardware', 'Software', 'Network', 'Access', 'Other']
const PRIORITIES  = ['Low', 'Medium', 'High', 'Critical']

const STATUS_COLOR = {
  'Open':        'badge-yellow',
  'In Progress': 'badge-blue',
  'Resolved':    'badge-green',
  'Closed':      'badge-gray',
}
const PRIORITY_COLOR = {
  'Low': 'badge-gray', 'Medium': 'badge-yellow', 'High': 'badge-red', 'Critical': 'badge-red'
}

export default function EmployeeITHelpdesk() {
  const [tickets,  setTickets]  = useState([])
  const [loading,  setLoading]  = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [saving,   setSaving]   = useState(false)
  const [success,  setSuccess]  = useState(false)
  const [form, setForm] = useState({
    subject: '', category: 'Software', priority: 'Medium', description: ''
  })

  const load = () => {
    setLoading(true)
    api.get('/employee/it-helpdesk')
      .then(d => { setTickets(d); setLoading(false) })
      .catch(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const submit = async e => {
    e.preventDefault()
    setSaving(true)
    try {
      await api.post('/employee/it-helpdesk', form)
      setForm({ subject: '', category: 'Software', priority: 'Medium', description: '' })
      setShowForm(false)
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
      load()
    } catch (err) { alert(err.message) }
    finally { setSaving(false) }
  }

  const fmt = iso => {
    if (!iso) return ''
    try { return new Date(iso).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' }) }
    catch { return iso }
  }

  return (
    <div className="emp-page">
      <div className="emp-page-header">
        <div><h1>🎧 IT Helpdesk</h1><p>Raise and track IT support tickets</p></div>
        <button className="emp-btn-primary" onClick={() => setShowForm(true)}>+ Raise Ticket</button>
      </div>

      {success && <div className="emp-success-banner">✅ Ticket raised successfully! Our IT team will respond soon.</div>}

      {/* Stats row */}
      <div className="emp-stats-row">
        {['Open','In Progress','Resolved','Closed'].map(s => (
          <div className="emp-stat-card" key={s}>
            <div className="emp-stat-value">{tickets.filter(t => t.status === s).length}</div>
            <div className="emp-stat-label">{s}</div>
          </div>
        ))}
      </div>

      {/* Ticket list */}
      <div className="emp-section">
        <h2>My Tickets</h2>
        {loading ? <p>Loading...</p> :
         tickets.length === 0 ? (
           <div className="emp-empty-state">
             <div className="emp-empty-icon">🎫</div>
             <p>No tickets raised yet. Click <strong>Raise Ticket</strong> for help.</p>
           </div>
         ) : (
          <div className="emp-ticket-list">
            {tickets.map(t => (
              <div className="emp-ticket-card" key={t.id}>
                <div className="emp-ticket-top">
                  <div className="emp-ticket-subject">{t.subject}</div>
                  <div style={{display:'flex',gap:'8px',alignItems:'center'}}>
                    <span className={`emp-badge ${PRIORITY_COLOR[t.priority]}`}>{t.priority}</span>
                    <span className={`emp-badge ${STATUS_COLOR[t.status]}`}>{t.status}</span>
                  </div>
                </div>
                <div className="emp-ticket-meta">
                  <span>📁 {t.category}</span>
                  <span>📅 {fmt(t.created_at)}</span>
                </div>
                <div className="emp-ticket-desc">{t.description}</div>
                {t.admin_note && (
                  <div className="emp-ticket-note">
                    <strong>💬 IT Team Note:</strong> {t.admin_note}
                  </div>
                )}
              </div>
            ))}
          </div>
         )
        }
      </div>

      {/* Modal */}
      {showForm && (
        <div className="emp-modal-overlay" onClick={() => setShowForm(false)}>
          <div className="emp-modal-box" onClick={e => e.stopPropagation()}>
            <div className="emp-modal-head">
              <h3>Raise IT Ticket</h3>
              <button className="emp-modal-x" onClick={() => setShowForm(false)}>✕</button>
            </div>
            <form className="emp-form" onSubmit={submit}>
              <div className="emp-field">
                <label>Subject</label>
                <input type="text" placeholder="Brief title of the issue" value={form.subject}
                  onChange={e => setForm({...form, subject: e.target.value})} required />
              </div>
              <div className="emp-form-row">
                <div className="emp-field">
                  <label>Category</label>
                  <select value={form.category} onChange={e => setForm({...form, category: e.target.value})}>
                    {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div className="emp-field">
                  <label>Priority</label>
                  <select value={form.priority} onChange={e => setForm({...form, priority: e.target.value})}>
                    {PRIORITIES.map(p => <option key={p}>{p}</option>)}
                  </select>
                </div>
              </div>
              <div className="emp-field">
                <label>Description</label>
                <textarea rows="4" placeholder="Describe the issue in detail..."
                  value={form.description}
                  onChange={e => setForm({...form, description: e.target.value})} required />
              </div>
              <button type="submit" className="emp-btn-primary" style={{width:'100%'}} disabled={saving}>
                {saving ? 'Submitting...' : 'Submit Ticket'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
