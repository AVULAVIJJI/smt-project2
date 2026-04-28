import React, { useState, useEffect } from 'react'
import { api } from '../../api'
import './Employee.css'

export default function EmployeeProfile() {
  const [profile, setProfile] = useState(null)
  const [editing, setEditing] = useState(false)
  const [form,    setForm]    = useState({})
  const [saved,   setSaved]   = useState(false)
  const [loading, setLoading] = useState(true)

  // Change Password
  const [showPw,   setShowPw]  = useState(false)
  const [pwForm,   setPwForm]  = useState({ current_password: '', new_password: '', confirm_password: '' })
  const [pwMsg,    setPwMsg]   = useState('')
  const [pwError,  setPwError] = useState('')
  const [pwLoad,   setPwLoad]  = useState(false)

  useEffect(() => {
    api.get('/employee/profile')
      .then(data => { setProfile(data); setForm(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const handleSave = async () => {
    try {
      await api.put('/employee/profile', form)
      setProfile(form)
      setEditing(false)
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    } catch (err) { alert(err.message) }
  }

  const handleChangePassword = async e => {
    e.preventDefault()
    setPwMsg(''); setPwError('')
    if (pwForm.new_password !== pwForm.confirm_password) {
      setPwError('New passwords do not match!'); return
    }
    if (pwForm.new_password.length < 6) {
      setPwError('Password must be at least 6 characters!'); return
    }
    setPwLoad(true)
    try {
      const emp = JSON.parse(localStorage.getItem('smt_employee') || '{}')
      await api.post('/employee/change-password', {
        emp_id: emp.empId,
        email: emp.email,
        new_password: pwForm.new_password
      })
      setPwMsg('✅ Password changed successfully!')
      setPwForm({ current_password: '', new_password: '', confirm_password: '' })
      setTimeout(() => { setPwMsg(''); setShowPw(false) }, 3000)
    } catch (err) {
      setPwError(err.message || 'Failed to change password')
    } finally { setPwLoad(false) }
  }

  if (loading) return <div className="emp-page"><p>Loading...</p></div>
  if (!profile) return <div className="emp-page"><p>Could not load profile.</p></div>

  const Field = ({ label, field, type='text' }) => (
    <div className="emp-profile-field">
      <label>{label}</label>
      {editing
        ? <input type={type} value={form[field]||''} onChange={e => setForm({...form, [field]: e.target.value})} />
        : <span>{profile[field] || '—'}</span>
      }
    </div>
  )

  return (
    <div className="emp-page">
      <div className="emp-page-header">
        <div><h1>My Profile</h1><p>View and update your personal information</p></div>
        {!editing
          ? <button className="emp-btn-primary" onClick={() => setEditing(true)}>✏️ Edit Profile</button>
          : <div style={{display:'flex',gap:'10px'}}>
              <button className="emp-btn-primary" onClick={handleSave}>💾 Save</button>
              <button className="emp-btn-outline" onClick={() => { setForm(profile); setEditing(false) }}>Cancel</button>
            </div>
        }
      </div>
      {saved && <div className="emp-success-banner">✅ Profile updated successfully!</div>}

      <div className="emp-profile-card">
        <div className="emp-profile-avatar-section">
          <div className="emp-profile-avatar">{(profile.name||'E')[0]}</div>
          <div>
            <div className="emp-profile-name">{profile.name}</div>
            <div className="emp-profile-role">{profile.role}</div>
            <div className="emp-profile-dept">{profile.dept}</div>
          </div>
        </div>
        <div className="emp-profile-grid">
          <Field label="Full Name"        field="name" />
          <Field label="Employee ID"      field="emp_id" />
          <Field label="Role"             field="role" />
          <Field label="Department"       field="dept" />
          <Field label="Email Address"    field="email" type="email" />
          <Field label="Phone Number"     field="phone" />
          <Field label="Date of Joining"  field="join_date" type="date" />
        </div>
      </div>

      {/* Change Password Section */}
      <div className="emp-profile-card" style={{marginTop:'20px'}}>
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
          <div>
            <h3 style={{margin:0}}>🔒 Change Password</h3>
            <p style={{margin:'4px 0 0', opacity:0.6, fontSize:'0.85rem'}}>Update your login password</p>
          </div>
          <button className="emp-btn-outline" onClick={() => { setShowPw(!showPw); setPwMsg(''); setPwError('') }}>
            {showPw ? 'Cancel' : 'Change Password'}
          </button>
        </div>

        {showPw && (
          <form onSubmit={handleChangePassword} style={{marginTop:'20px'}}>
            {pwError && <div className="emp-error" style={{marginBottom:'12px'}}>{pwError}</div>}
            {pwMsg   && <div className="emp-success-banner" style={{marginBottom:'12px'}}>{pwMsg}</div>}
            <div className="emp-profile-grid">
              <div className="emp-profile-field">
                <label>New Password</label>
                <input type="password" placeholder="Min 6 characters"
                  value={pwForm.new_password}
                  onChange={e => setPwForm({...pwForm, new_password: e.target.value})}
                  required />
              </div>
              <div className="emp-profile-field">
                <label>Confirm New Password</label>
                <input type="password" placeholder="Re-enter new password"
                  value={pwForm.confirm_password}
                  onChange={e => setPwForm({...pwForm, confirm_password: e.target.value})}
                  required />
              </div>
            </div>
            <button type="submit" className="emp-btn-primary"
              style={{marginTop:'16px'}} disabled={pwLoad}>
              {pwLoad ? 'Saving...' : '🔒 Update Password'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}