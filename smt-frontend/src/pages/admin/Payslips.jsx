import React, { useState, useEffect } from 'react'
import { api } from '../../api'
import './Admin.css'

const EMPTY = { emp_id:'', month_label:'', gross_pay:'', deductions:'0', net_pay:'', status:'Pending' }

export default function Payslips() {
  const [payslips, setPayslips] = useState([])
  const [employees, setEmployees] = useState([])
  const [form, setForm]         = useState(EMPTY)
  const [showForm, setShow]     = useState(false)
  const [loading, setLoading]   = useState(true)

  const load = async () => {
    try {
      const [p, e] = await Promise.all([api.get('/admin/payslips'), api.get('/admin/employees')])
      setPayslips(p)
      setEmployees(e)
    } catch(e) { alert(e.message) }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const save = async () => {
    try { await api.post('/admin/payslips', form); setShow(false); setForm(EMPTY); load() }
    catch(e) { alert(e.message) }
  }

  const updateStatus = async (id, status) => {
    try { await api.patch(`/admin/payslips/${id}/status`, { status }); load() }
    catch(e) { alert(e.message) }
  }

  const del = async id => {
    if (!window.confirm('Delete this payslip?')) return
    try { await api.delete(`/admin/payslips/${id}`); load() }
    catch(e) { alert(e.message) }
  }

  if (loading) return <div className="admin-page"><p>Loading...</p></div>

  return (
    <div className="admin-page">
      <div className="admin-page-head">
        <div><h1>Payslips</h1><p>Generate and manage employee payslips.</p></div>
        <button className="btn-admin-primary" onClick={() => setShow(!showForm)}>+ Generate Payslip</button>
      </div>

      {showForm && (
        <div className="admin-form-box">
          <h3>Generate Payslip</h3>
          <div className="af-grid">
            <div className="lf-group">
              <label>Employee</label>
              <select value={form.emp_id} onChange={e => setForm({...form, emp_id:e.target.value})} style={{width:'100%',padding:'10px',borderRadius:'8px',background:'rgba(255,255,255,0.1)',color:'inherit',border:'1px solid rgba(255,255,255,0.1)'}}>
                <option value="">Select Employee</option>
                {employees.map(e => <option key={e.id} value={e.emp_id}>{e.name} ({e.emp_id})</option>)}
              </select>
            </div>
            <div className="lf-group"><label>Month</label><input value={form.month_label} onChange={e => setForm({...form, month_label:e.target.value})} placeholder="e.g. April 2026" /></div>
            <div className="lf-group"><label>Gross Pay (₹)</label><input type="number" value={form.gross_pay} onChange={e => setForm({...form, gross_pay:e.target.value})} placeholder="50000" /></div>
            <div className="lf-group"><label>Deductions (₹)</label><input type="number" value={form.deductions} onChange={e => setForm({...form, deductions:e.target.value})} placeholder="0" /></div>
            <div className="lf-group"><label>Net Pay (₹)</label><input type="number" value={form.net_pay} onChange={e => setForm({...form, net_pay:e.target.value})} placeholder="50000" /></div>
            <div className="lf-group">
              <label>Status</label>
              <select value={form.status} onChange={e => setForm({...form, status:e.target.value})} style={{width:'100%',padding:'10px',borderRadius:'8px',background:'rgba(255,255,255,0.1)',color:'inherit',border:'1px solid rgba(255,255,255,0.1)'}}>
                <option>Pending</option><option>Paid</option>
              </select>
            </div>
          </div>
          <div className="form-actions">
            <button className="btn-admin-primary" onClick={save}>Generate</button>
            <button className="btn-admin-ghost" onClick={() => setShow(false)}>Cancel</button>
          </div>
        </div>
      )}

      <div className="admin-section">
        {payslips.length === 0 ? <div className="empty-state">No payslips yet.</div> : (
          <table className="admin-table">
            <thead><tr><th>Employee</th><th>Month</th><th>Gross</th><th>Deductions</th><th>Net Pay</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>{payslips.map(p => (
              <tr key={p.id}>
                <td>{p.smt_employees?.name || p.employee_id}</td>
                <td>{p.month_label}</td>
                <td>₹{Number(p.gross_pay).toLocaleString()}</td>
                <td>₹{Number(p.deductions).toLocaleString()}</td>
                <td>₹{Number(p.net_pay).toLocaleString()}</td>
                <td><span className={`status-badge status-${p.status==='Paid'?'active':'reviewing'}`}>{p.status}</span></td>
                <td className="table-actions">
                  <button className="tbl-btn" onClick={() => updateStatus(p.id, p.status==='Paid'?'Pending':'Paid')}>{p.status==='Paid'?'Mark Pending':'Mark Paid'}</button>
                  <button className="tbl-btn danger" onClick={() => del(p.id)}>Delete</button>
                </td>
              </tr>
            ))}</tbody>
          </table>
        )}
      </div>
    </div>
  )
}