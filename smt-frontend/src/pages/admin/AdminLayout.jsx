import React, { useEffect } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import './Admin.css'

const NAV = [
  { to: '/admin',                label: 'Dashboard',     icon: '⌧'  },
  { to: '/admin/jobs',           label: 'Job Listings',  icon: '📋' },
  { to: '/admin/applications',   label: 'Applications',  icon: '📄' },
  { to: '/admin/employees',      label: 'Employees',     icon: '👥' },
  { to: '/admin/leaves',         label: 'Leaves',        icon: '🌴' },
  { to: '/admin/tasks',          label: 'Tasks',         icon: '✅' },
  { to: '/admin/payslips',       label: 'Payslips',      icon: '💰' },
  { to: '/admin/announcements',  label: 'Announcements', icon: '📢' },
]

export default function AdminLayout() {
  const navigate = useNavigate()

  useEffect(() => {
    if (!localStorage.getItem('smt_token')) navigate('/admin/login')
  }, [])

  const logout = () => {
    localStorage.removeItem('smt_token')
    localStorage.removeItem('smt_admin')
    navigate('/admin/login')
  }

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <div className="sidebar-logo">
          <img src="/logo.png" alt="SMT" style={{width:'36px',height:'36px',objectFit:'contain'}} />
          
        </div>
        <nav className="sidebar-nav">
          {NAV.map(n => (
            <NavLink key={n.to} to={n.to} end={n.to === '/admin'}
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
              <span className="sidebar-icon">{n.icon}</span>
              {n.label}
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <a href="/" className="sidebar-link">🌐 View Website ↗</a>
          <button className="btn-logout" onClick={logout}>Log Out</button>
        </div>
      </aside>
      <main className="admin-main">
        <Outlet />
      </main>
    </div>
  )
}