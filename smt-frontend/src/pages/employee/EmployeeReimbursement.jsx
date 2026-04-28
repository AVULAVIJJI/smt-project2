import React, { useState, useEffect } from 'react'
import { api } from '../../api'
import './Employee.css'

const CATEGORIES = ['Travel', 'Food', 'Equipment', 'Accommodation', 'Other']
const STATUS_COLOR = { 'Pending': 'badge-yellow', 'Approved': 'badge-green', 'Rejected': 'badge-red' }

export default function EmployeeReimbursement() {
  const [items,    setItems]    = useState([])
  const [loading,  setLoading]  = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [saving,   setSaving]   = useState(false)
  const [success,  setSuccess]  = useState(false)
  const [form, setForm] = useState({
    category: 'Travel', amount: '', expense_date: '', description: '', bill_ref: ''
  })

  const load = () => {
    setLoading(true)
    api.get('/employee/reimbursements')
      .then(d => { setItems(d); setLoading(false) })
      .catch(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const submit = async e => {
    e.preventDefault()
    if (!form.amount || Number(form.amount) <= 0) return alert('Enter a valid amount')
    setSaving(true)
    try {
      await api.post('/employee/reimbursements', { ...form, amount: Number(form.amount) })
      setForm({ category: 'Travel', amount: '', expense_date: '', description: '', bill_ref: '' })
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

  const totalPending  = items.filter(i => i.status === 'Pending').reduce((s, i) => s + i.amount, 0)
  const totalApproved = items.filter(i => i.status === 'Approved').reduce((s, i) => s + i.amount, 0)

  return (
    <div className="emp-page">
      <div className="emp-page-header">
        <div><h1>💳 Reimbursement</h1><p>Submit and track expense claims</p></div>
        <button className="emp-btn-primary" onClick={() => setShowForm(true)}>+ New Claim</button>
      </div>

      {success && <div className="emp-success-banner">✅ Reimbursement claim submitted successfully!</div>}

      {/* Summary */}
      <div className="emp-stats-row">
        {[
          { label: 'Pending Claims',  value: items.filter(i=>i.status==='Pending').length,  icon: '⏳' },
          { label: 'Approved Claims', value: items.filter(i=>i.status==='Approved').length, icon: '✅' },
          { label: 'Pending Amount',  value: `₹${totalPending.toLocaleString()}`,           icon: '💰' },
          { label: 'Approved Amount', value: `₹${totalApproved.toLocaleString()}`,          icon: '🏦' },
        ].map(s => (
          <div className="emp-stat-card" key={s.label}>
            <div className="emp-stat-icon">{s.icon}</div>
            <div className="emp-stat-value" style={{fontSize: typeof s.value==='string' && s.value.length>6 ? '18px':'28px'}}>
              {s.value}
            </div>
            <div className="emp-stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="emp-section">
        <h2>My Claims</h2>
        <div className="emp-table-wrap">
          <table className="emp-table">
            <thead>
              <tr><th>Category</th><th>Amount</th><th>Expense Date</th><th>Description</th><th>Bill Ref</th><th>Status</th><th>Admin Note</th></tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="7">Loading...</td></tr>
              ) : items.length === 0 ? (
                <tr><td colSpan="7" style={{textAlign:'center'}}>No claims submitted yet.</td></tr>
              ) : items.map(r => (
                <tr key={r.id}>
                  <td>{r.category}</td>
                  <td><strong>₹{Number(r.amount).toLocaleString()}</strong></td>
                  <td>{r.expense_date}</td>
                  <td>{r.description}</td>
                  <td>{r.bill_ref || '—'}</td>
                  <td><span className={`emp-badge ${STATUS_COLOR[r.status]}`}>{r.status}</span></td>
                  <td>{r.admin_note || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showForm && (
        <div className="emp-modal-overlay" onClick={() => setShowForm(false)}>
          <div className="emp-modal-box" onClick={e => e.stopPropagation()}>
            <div className="emp-modal-head">
              <h3>Submit Expense Claim</h3>
              <button className="emp-modal-x" onClick={() => setShowForm(false)}>✕</button>
            </div>
            <form className="emp-form" onSubmit={submit}>
              <div className="emp-form-row">
                <div className="emp-field">
                  <label>Category</label>
                  <select value={form.category} onChange={e => setForm({...form, category: e.target.value})}>
                    {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div className="emp-field">
                  <label>Amount (₹)</label>
                  <input type="number" min="1" placeholder="0.00" value={form.amount}
                    onChange={e => setForm({...form, amount: e.target.value})} required />
                </div>
              </div>
              <div className="emp-form-row">
                <div className="emp-field">
                  <label>Expense Date</label>
                  <input type="date" value={form.expense_date}
                    onChange={e => setForm({...form, expense_date: e.target.value})} required />
                </div>
                <div className="emp-field">
                  <label>Bill / Receipt Ref</label>
                  <input type="text" placeholder="Invoice no. (optional)" value={form.bill_ref}
                    onChange={e => setForm({...form, bill_ref: e.target.value})} />
                </div>
              </div>
              <div className="emp-field">
                <label>Description</label>
                <textarea rows="3" placeholder="Purpose of the expense..."
                  value={form.description}
                  onChange={e => setForm({...form, description: e.target.value})} required />
              </div>
              <button type="submit" className="emp-btn-primary" style={{width:'100%'}} disabled={saving}>
                {saving ? 'Submitting...' : 'Submit Claim'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
