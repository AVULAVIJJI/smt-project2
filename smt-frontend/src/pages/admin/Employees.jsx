import React, { useState, useEffect } from 'react'
import { api } from '../../api'
import './Admin.css'

const EMPTY = { emp_id:'', name:'', role:'', dept:'', email:'', phone:'', join_date:'', salary:'', status:'Active', password:'smt123' }

export default function Employees() {
  const [emps,     setEmps]    = useState([])
  const [form,     setForm]    = useState(EMPTY)
  const [editing,  setEditing] = useState(null)
  const [showForm, setShow]    = useState(false)
  const [search,   setSearch]  = useState('')
  const [loading,  setLoading] = useState(true)
  const [error,    setError]   = useState('')
  const [saving,   setSaving]  = useState(false)

  useEffect(() => { loadEmps() }, [])

  const loadEmps = () => {
    setLoading(true)
    api.get('/admin/employees')
      .then(data => { setEmps(data); setLoading(false) })
      .catch(err => { setError(err.message); setLoading(false) })
  }

  const save = async () => {
    if (!form.name || !form.emp_id) return alert('Name and Employee ID are required')
    setSaving(true)
    try {
      if (editing !== null) {
        await api.put(`/admin/employees/${editing}`, form)
        setEditing(null)
      } else {
        await api.post('/admin/employees', form)
      }
      setForm(EMPTY)
      setShow(false)
      loadEmps()
    } catch (err) {
      alert(err.message)
    } finally {
      setSaving(false)
    }
  }

  const del = async (id) => {
    if (!window.confirm('Remove this employee?')) return
    try {
      await api.delete(`/admin/employees/${id}`)
      loadEmps()
    } catch (err) { alert(err.message) }
  }

  const edit = (emp) => {
    setForm({ ...emp, password: '' })
    setEditing(emp.id)
    setShow(true)
  }

  const filtered = emps.filter(e =>
    e.name?.toLowerCase().includes(search.toLowerCase()) ||
    e.role?.toLowerCase().includes(search.toLowerCase()) ||
    e.dept?.toLowerCase().includes(search.toLowerCase())
  )

  const initials = name => name ? name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0,2) : '??'

  return (
    <div className="admin-page">
      <div className="admin-page-head">
        <div><h1>Employees</h1><p>Manage your team members.</p></div>
        <button className="btn-admin-primary" onClick={() => { setForm(EMPTY); setEditing(null); setShow(true) }}>
          + Add Employee
        </button>
      </div>

      {error && <div className="login-error">{error}</div>}

      {showForm && (
        <div className="admin-form-box">
          <h3>{editing !== null ? 'Edit Employee' : 'Add New Employee'}</h3>
          <div className="af-grid">
            <div className="lf-group"><label>Employee ID *</label>
              <input value={form.emp_id} onChange={e => setForm({...form, emp_id: e.target.value})} placeholder="e.g. SMT-001" /></div>
            <div className="lf-group"><label>Full Name *</label>
              <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="John Doe" /></div>
            <div className="lf-group"><label>Job Role</label>
              <input value={form.role} onChange={e => setForm({...form, role: e.target.value})} placeholder="e.g. React Developer" /></div>
            <div className="lf-group"><label>Department</label>
              <input value={form.dept} onChange={e => setForm({...form, dept: e.target.value})} placeholder="e.g. Engineering" /></div>
            <div className="lf-group"><label>Email</label>
              <input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} placeholder="john@smt.com" /></div>
            <div className="lf-group"><label>Phone</label>
              <input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} placeholder="+91 98765 43210" /></div>
            <div className="lf-group"><label>Join Date</label>
              <input type="date" value={form.join_date} onChange={e => setForm({...form, join_date: e.target.value})} /></div>
            <div className="lf-group"><label>Salary (₹/month)</label>
              <input value={form.salary} onChange={e => setForm({...form, salary: e.target.value})} placeholder="e.g. 45000" /></div>
            <div className="lf-group"><label>Password {editing ? '(leave blank to keep)' : ''}</label>
              <input value={form.password} onChange={e => setForm({...form, password: e.target.value})} placeholder="smt123" /></div>
            <div className="lf-group"><label>Status</label>
              <select value={form.status} onChange={e => setForm({...form, status: e.target.value})}>
                <option>Active</option><option>On Leave</option><option>Resigned</option>
              </select></div>
          </div>
          <div className="form-actions">
            <button className="btn-admin-primary" onClick={save} disabled={saving}>
              {saving ? 'Saving...' : editing !== null ? 'Save Changes' : 'Add Employee'}
            </button>
            <button className="btn-admin-ghost" onClick={() => setShow(false)}>Cancel</button>
          </div>
        </div>
      )}

      <div className="admin-section">
        <input className="admin-search" placeholder="Search employees..."
          value={search} onChange={e => setSearch(e.target.value)} style={{marginBottom:20}} />
        {loading ? <div className="empty-state">Loading...</div> :
         filtered.length === 0 ? <div className="empty-state">No employees found.</div> : (
          <div className="emp-grid">
            {filtered.map(emp => (
              <div className="emp-card" key={emp.id}>
                <div className="emp-avatar">{initials(emp.name)}</div>
                <div className="emp-info">
                  <strong>{emp.name}</strong>
                  <p>{emp.role}</p>
                  <span className="emp-dept">{emp.dept}</span>
                </div>
                <div className="emp-meta">
                  {emp.email    && <p>✉ {emp.email}</p>}
                  {emp.phone    && <p>📞 {emp.phone}</p>}
                  {emp.join_date && <p>📅 Joined {emp.join_date}</p>}
                  {emp.salary   && <p>💰 ₹{emp.salary}/mo</p>}
                </div>
                <div className="emp-footer">
                  <span className={`status-badge status-${emp.status === 'Active' ? 'active' : emp.status === 'On Leave' ? 'reviewing' : 'rejected'}`}>
                    {emp.status}
                  </span>
                  <div className="table-actions">
                    <button className="tbl-btn" onClick={() => edit(emp)}>Edit</button>
                    <button className="tbl-btn danger" onClick={() => del(emp.id)}>Remove</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
