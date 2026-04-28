import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api } from '../../api'
import './Employee.css'

export default function EmployeeLogin() {
  const [tab,     setTab]    = useState('login')
  const [form,    setForm]   = useState({ email: '', password: '' })
  const [forgot,  setForgot] = useState({ emp_id: '', email: '' })
  const [error,   setError]  = useState('')
  const [info,    setInfo]   = useState('')
  const [tempPw,  setTempPw] = useState('')
  const [loading, setLoad]   = useState(false)
  const navigate = useNavigate()

  const handleLogin = async e => {
    e.preventDefault()
    setError(''); setInfo('')
    setLoad(true)
    try {
      const res = await api.post('/employee/login', form)
      localStorage.setItem('smt_token',    res.token)
      localStorage.setItem('smt_employee', JSON.stringify(res.employee))
      navigate('/employee')
    } catch (err) {
      setError(err.message || 'Invalid email or password.')
    } finally { setLoad(false) }
  }

  const handleForgot = async e => {
    e.preventDefault()
    setError(''); setInfo(''); setTempPw('')
    setLoad(true)
    try {
      const res = await api.post('/employee/forgot-password', forgot)
      setTempPw(res.temp_password)
      setInfo(res.message)
    } catch (err) {
      setError(err.message || 'No matching employee found.')
    } finally { setLoad(false) }
  }

  return (
    <div className="emp-login-page">
      <div className="emp-login-card">
        <Link to="/" className="emp-back-home">← Back to Website</Link>
        <div className="emp-login-logo">
          <img src="/logo.png" alt="SMT" style={{width:'48px',height:'48px',objectFit:'contain'}} />
          
        </div>

        <div className="emp-login-tabs">
          <button className={`emp-tab-btn ${tab === 'login' ? 'active' : ''}`}
            onClick={() => { setTab('login'); setError(''); setInfo(''); setTempPw('') }}>
            Sign In
          </button>
          <button className={`emp-tab-btn ${tab === 'forgot' ? 'active' : ''}`}
            onClick={() => { setTab('forgot'); setError(''); setInfo(''); setTempPw('') }}>
            Forgot Password
          </button>
        </div>

        {error && <div className="emp-error">{error}</div>}
        {info  && !tempPw && <div className="emp-success-banner">{info}</div>}

        {tab === 'login' && (
          <>
            <h2>Welcome Back</h2>
            <p className="emp-login-sub">Sign in to access your employee dashboard</p>
            <form className="emp-login-form" onSubmit={handleLogin}>
              <div className="emp-field">
                <label>Email</label>
                <input type="email" placeholder="your@email.com" value={form.email}
                  onChange={e => setForm({...form, email: e.target.value})} required />
              </div>
              <div className="emp-field">
                <label>Password</label>
                <input type="password" placeholder="Enter your password" value={form.password}
                  onChange={e => setForm({...form, password: e.target.value})} required />
              </div>
              <button type="submit" className="emp-login-btn" disabled={loading}>
                {loading ? 'Signing in...' : 'Sign In →'}
              </button>
            </form>
            <p className="emp-hint">Default password: <strong>smt123</strong></p>
          </>
        )}

        {tab === 'forgot' && (
          <>
            <h2>Reset Password</h2>
            <p className="emp-login-sub">Enter your Employee ID and registered email to get a temporary password.</p>
            {tempPw ? (
              <div className="emp-temp-pw-box">
                <p>✅ {info}</p>
                <div className="emp-temp-pw-display">
                  <span>Temporary Password:</span>
                  <strong>{tempPw}</strong>
                </div>
                <p className="emp-hint" style={{marginTop:'10px'}}>
                  ⚠️ Please log in with this password and change it immediately.
                </p>
                <button className="emp-login-btn" style={{marginTop:'12px'}}
                  onClick={() => { setTab('login'); setTempPw(''); setInfo('') }}>
                  Go to Login →
                </button>
              </div>
            ) : (
              <form className="emp-login-form" onSubmit={handleForgot}>
                <div className="emp-field">
                  <label>Employee ID</label>
                  <input type="text" placeholder="e.g. SMT20261" value={forgot.emp_id}
                    onChange={e => setForgot({...forgot, emp_id: e.target.value})} required />
                </div>
                <div className="emp-field">
                  <label>Registered Email</label>
                  <input type="email" placeholder="your@email.com" value={forgot.email}
                    onChange={e => setForgot({...forgot, email: e.target.value})} required />
                </div>
                <button type="submit" className="emp-login-btn" disabled={loading}>
                  {loading ? 'Verifying...' : 'Get Temporary Password →'}
                </button>
              </form>
            )}
          </>
        )}
      </div>
    </div>
  )
}