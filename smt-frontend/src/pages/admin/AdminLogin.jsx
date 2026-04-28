import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../../api'
import './Admin.css'

export default function AdminLogin() {
  const [form, setForm]    = useState({ username: '', password: '' })
  const [error, setError]  = useState('')
  const [loading, setLoad] = useState(false)
  const navigate            = useNavigate()

  const handleSubmit = async e => {
    e.preventDefault()
    setError('')
    setLoad(true)
    try {
      const res = await api.post('/admin/login', form)
      localStorage.setItem('smt_token', res.token)
      localStorage.setItem('smt_admin', JSON.stringify({ username: res.username }))
      navigate('/admin')
    } catch (err) {
      setError(err.message || 'Invalid username or password.')
    } finally {
      setLoad(false)
    }
  }

  return (
    <div className="login-page">
      <div className="login-box">
        <div className="login-logo">
          <img src="/logo.png" alt="SMT" style={{width:'48px',height:'48px',objectFit:'contain'}} />
          <span>Soft Master <em>Technology Solutions</em></span>
        </div>
        <h2>Admin Login</h2>
        <p>Sign in to access the admin panel</p>
        <form className="login-form" onSubmit={handleSubmit}>
          <div className="lf-group">
            <label>Username</label>
            <input type="text" placeholder="admin" value={form.username}
              onChange={e => setForm({ ...form, username: e.target.value })} required />
          </div>
          <div className="lf-group">
            <label>Password</label>
            <input type="password" placeholder="••••••••" value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })} required />
          </div>
          {error && <div className="login-error">{error}</div>}
          <button type="submit" className="btn-login" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In →'}
          </button>
        </form>
        <p className="login-hint">Default: admin / smt@2025</p>
      </div>
    </div>
  )
}