import React, { useState, useEffect } from 'react'
import { api } from '../../api'
import './Admin.css'

const EMPTY = { title:'', dept:'', location:'', type:'Full-Time', experience:'', description:'', is_active:true }

export default function Jobs() {
  const [jobs,     setJobs]    = useState([])
  const [form,     setForm]    = useState(EMPTY)
  const [editing,  setEditing] = useState(null)
  const [showForm, setShow]    = useState(false)
  const [loading,  setLoading] = useState(true)
  const [saving,   setSaving]  = useState(false)

  useEffect(() => { loadJobs() }, [])

  const loadJobs = () => {
    setLoading(true)
    api.get('/admin/jobs')
      .then(data => { setJobs(data); setLoading(false) })
      .catch(() => setLoading(false))
  }

  const save = async () => {
    if (!form.title) return alert('Title is required')
    setSaving(true)
    try {
      if (editing !== null) {
        await api.put(`/admin/jobs/${editing}`, form)
        setEditing(null)
      } else {
        await api.post('/admin/jobs', form)
      }
      setForm(EMPTY); setShow(false); loadJobs()
    } catch (err) { alert(err.message) }
    finally { setSaving(false) }
  }

  const del = async (id) => {
    if (!window.confirm('Delete this job?')) return
    await api.delete(`/admin/jobs/${id}`).catch(err => alert(err.message))
    loadJobs()
  }

  const toggle = async (id) => {
    await api.patch(`/admin/jobs/${id}/toggle`).catch(err => alert(err.message))
    loadJobs()
  }

  const edit = (job) => { setForm({...job}); setEditing(job.id); setShow(true) }

  return (
    <div className="admin-page">
      <div className="admin-page-head">
        <div><h1>Job Listings</h1><p>Post and manage open positions.</p></div>
        <button className="btn-admin-primary" onClick={() => { setForm(EMPTY); setEditing(null); setShow(true) }}>
          + Post New Job
        </button>
      </div>

      {showForm && (
        <div className="admin-form-box">
          <h3>{editing !== null ? 'Edit Job' : 'Post New Job'}</h3>
          <div className="af-grid">
            <div className="lf-group"><label>Job Title *</label>
              <input value={form.title} onChange={e => setForm({...form, title: e.target.value})} placeholder="e.g. React Developer" /></div>
            <div className="lf-group"><label>Department</label>
              <input value={form.dept} onChange={e => setForm({...form, dept: e.target.value})} placeholder="e.g. Engineering" /></div>
            <div className="lf-group"><label>Location</label>
              <input value={form.location} onChange={e => setForm({...form, location: e.target.value})} placeholder="e.g. Vijayawada / Remote" /></div>
            <div className="lf-group"><label>Type</label>
              <select value={form.type} onChange={e => setForm({...form, type: e.target.value})}>
                <option>Full-Time</option><option>Part-Time</option><option>Internship</option><option>Contract</option>
              </select></div>
            <div className="lf-group"><label>Experience</label>
              <input value={form.experience} onChange={e => setForm({...form, experience: e.target.value})} placeholder="e.g. 2–4 years" /></div>
          </div>
          <div className="lf-group"><label>Job Description *</label>
            <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})}
              placeholder="Describe the role..." rows={4} /></div>
          <div className="form-actions">
            <button className="btn-admin-primary" onClick={save} disabled={saving}>
              {saving ? 'Saving...' : editing !== null ? 'Save Changes' : 'Post Job'}
            </button>
            <button className="btn-admin-ghost" onClick={() => setShow(false)}>Cancel</button>
          </div>
        </div>
      )}

      <div className="admin-section">
        {loading ? <div className="empty-state">Loading...</div> :
         jobs.length === 0 ? <div className="empty-state">No jobs posted yet.</div> : (
          <table className="admin-table">
            <thead><tr><th>Title</th><th>Dept</th><th>Type</th><th>Location</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {jobs.map(j => (
                <tr key={j.id}>
                  <td><strong>{j.title}</strong></td>
                  <td>{j.dept}</td><td>{j.type}</td><td>{j.location}</td>
                  <td><span className={`status-badge ${j.is_active ? 'status-active' : 'status-closed'}`}>
                    {j.is_active ? 'Active' : 'Closed'}
                  </span></td>
                  <td className="table-actions">
                    <button className="tbl-btn" onClick={() => edit(j)}>Edit</button>
                    <button className="tbl-btn" onClick={() => toggle(j.id)}>{j.is_active ? 'Close' : 'Reopen'}</button>
                    <button className="tbl-btn danger" onClick={() => del(j.id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
