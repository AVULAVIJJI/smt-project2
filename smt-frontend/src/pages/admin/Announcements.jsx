import React, { useState, useEffect } from 'react'
import { api } from '../../api'
import './Admin.css'

const TAGS  = ['General', 'Holiday', 'HR', 'Project', 'IT']
const EMPTY = { title: '', body: '', tag: 'General', pinned: false }

export default function Announcements() {
  const [items,    setItems]   = useState([])
  const [form,     setForm]    = useState(EMPTY)
  const [showForm, setShow]    = useState(false)
  const [loading,  setLoading] = useState(true)
  const [saving,   setSaving]  = useState(false)

  const load = async () => {
    try {
      const data = await api.get('/employee/announcements')
      setItems(data)
    } catch (e) { alert(e.message) }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const save = async () => {
    if (!form.title || !form.body) return alert('Title and Body required')
    setSaving(true)
    try {
      await api.post('/admin/announcements', form)
      setForm(EMPTY)
      setShow(false)
      load()
    } catch (e) { alert(e.message) }
    finally { setSaving(false) }
  }

  const del = async (id) => {
    if (!window.confirm('Delete this announcement?')) return
    try { await api.delete(`/admin/announcements/${id}`); load() }
    catch (e) { alert(e.message) }
  }

  const fmt = iso => {
    if (!iso) return ''
    try { return new Date(iso).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' }) }
    catch { return '' }
  }

  const TAG_COLOR = {
    Holiday: 'status-active',
    HR:      'status-reviewing',
    Project: 'status-new',
    IT:      'status-reviewing',
    General: 'status-closed',
  }

  if (loading) return <div className="admin-page"><p>Loading...</p></div>

  return (
    <div className="admin-page">
      <div className="admin-page-head">
        <div>
          <h1>📢 Announcements</h1>
          <p>Create and manage company-wide announcements for employees.</p>
        </div>
        <button className="btn-admin-primary" onClick={() => setShow(!showForm)}>
          + New Announcement
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="admin-form-box">
          <h3>Create Announcement</h3>
          <div className="af-grid">
            <div className="lf-group" style={{gridColumn:'1/-1'}}>
              <label>Title *</label>
              <input
                value={form.title}
                onChange={e => setForm({...form, title: e.target.value})}
                placeholder="Announcement title..."
              />
            </div>
            <div className="lf-group" style={{gridColumn:'1/-1'}}>
              <label>Body *</label>
              <textarea
                rows="4"
                value={form.body}
                onChange={e => setForm({...form, body: e.target.value})}
                placeholder="Announcement details..."
                style={{width:'100%', padding:'10px', borderRadius:'8px', background:'rgba(255,255,255,0.1)', color:'inherit', border:'1px solid rgba(255,255,255,0.15)', resize:'vertical'}}
              />
            </div>
            <div className="lf-group">
              <label>Tag</label>
              <select
                value={form.tag}
                onChange={e => setForm({...form, tag: e.target.value})}
                style={{width:'100%', padding:'10px', borderRadius:'8px', background:'rgba(255,255,255,0.1)', color:'inherit', border:'1px solid rgba(255,255,255,0.15)'}}>
                {TAGS.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div className="lf-group" style={{display:'flex', alignItems:'center', gap:'10px', paddingTop:'24px'}}>
              <input
                type="checkbox"
                id="pinned"
                checked={form.pinned}
                onChange={e => setForm({...form, pinned: e.target.checked})}
                style={{width:'18px', height:'18px', cursor:'pointer'}}
              />
              <label htmlFor="pinned" style={{cursor:'pointer', marginBottom:0}}>📌 Pin this announcement</label>
            </div>
          </div>
          <div className="form-actions">
            <button className="btn-admin-primary" onClick={save} disabled={saving}>
              {saving ? 'Publishing...' : 'Publish'}
            </button>
            <button className="btn-admin-ghost" onClick={() => { setShow(false); setForm(EMPTY) }}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* List */}
      <div className="admin-section">
        {items.length === 0 ? (
          <div className="empty-state">No announcements yet. Create one above!</div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Body</th>
                <th>Tag</th>
                <th>Pinned</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map(a => (
                <tr key={a.id}>
                  <td><strong>{a.title}</strong></td>
                  <td style={{maxWidth:'250px', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>
                    {a.body}
                  </td>
                  <td>
                    <span className={`status-badge ${TAG_COLOR[a.tag] || 'status-closed'}`}>
                      {a.tag}
                    </span>
                  </td>
                  <td>{a.pinned ? '📌 Yes' : '—'}</td>
                  <td>{fmt(a.created_at)}</td>
                  <td className="table-actions">
                    <button className="tbl-btn danger" onClick={() => del(a.id)}>Delete</button>
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