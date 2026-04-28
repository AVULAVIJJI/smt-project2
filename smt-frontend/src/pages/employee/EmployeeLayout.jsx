import React, { useEffect, useState } from 'react'
import { Outlet, NavLink, useNavigate, Link, useLocation } from 'react-router-dom'
import './Employee.css'

const NAV = [
  { to: '/employee', label: 'Dashboard', icon: '⊞', end: true, direct: true },
  { label: 'My Data', icon: '🗂️', children: [
    { to: '/employee/my-data/profile',    label: 'My Profile' },
    { to: '/employee/my-data/payslips',   label: 'Pay Slips' },
    { to: '/employee/my-data/attendance', label: 'Attendance' },
    { to: '/employee/my-data/documents',  label: 'Documents' },
  ]},
  { label: 'HR', icon: '👤', children: [
    { to: '/employee/hr/leaves',     label: 'Leave Tracker' },
    { to: '/employee/hr/policies',   label: 'HR Policies' },
    { to: '/employee/hr/onboarding', label: 'Onboarding' },
    { to: '/employee/hr/exit',       label: 'Exit Formalities' },
  ]},
  { label: 'My Development', icon: '📊', children: [
    { to: '/employee/my-development/goals',       label: 'My Goals' },
    { to: '/employee/my-development/training',    label: 'Training & Courses' },
    { to: '/employee/my-development/performance', label: 'Performance Review' },
  ]},
  { label: 'Finance', icon: '💲', children: [
    { to: '/employee/finance/payslips',      label: 'Pay Slips' },
    { to: '/employee/finance/reimbursement', label: 'Reimbursement' },
    { to: '/employee/finance/tax',           label: 'Tax Declaration' },
  ]},
  { label: 'IT', icon: '⚙️', children: [
    { to: '/employee/it/helpdesk', label: 'IT Helpdesk' },
    { to: '/employee/it/assets',   label: 'IT Assets' },
    { to: '/employee/it/software', label: 'Software Requests' },
  ]},
  { label: 'Misc', icon: '🌐', children: [
    { to: '/employee/misc/announcements', label: 'Announcements' },
    { to: '/employee/misc/directory',     label: 'Employee Directory' },
    { to: '/employee/misc/links',         label: 'Useful Links' },
  ]},
  { to: '/employee/tasks', label: 'My Tasks', icon: '✅', direct: true },
]

export default function EmployeeLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const [openSections, setOpenSections] = useState({})
  const [sidebarOpen,  setSidebarOpen]  = useState(false)

  useEffect(() => {
    if (!localStorage.getItem('smt_token')) navigate('/employee/login')
  }, [])

  useEffect(() => {
    NAV.forEach((n, i) => {
      if (n.children && n.children.some(c => location.pathname.startsWith(c.to))) {
        setOpenSections(prev => ({ ...prev, [i]: true }))
      }
    })
  }, [location.pathname])

  const logout = () => {
    localStorage.removeItem('smt_token')
    localStorage.removeItem('smt_employee')
    navigate('/employee/login')
  }

  const emp    = JSON.parse(localStorage.getItem('smt_employee') || '{}')
  const toggle = (i) => setOpenSections(prev => ({ ...prev, [i]: !prev[i] }))

  return (
    <div className="emp-shell">
      {sidebarOpen && <div className="emp-sidebar-overlay" onClick={() => setSidebarOpen(false)} />}
      <aside className={`emp-sidebar ${sidebarOpen ? 'emp-sidebar-open' : ''}`}>
        <div className="emp-sidebar-logo">
          <img src="/logo.png" alt="SMT" style={{width:'36px',height:'36px',objectFit:'contain'}} />
          
        </div>
        <div className="emp-sidebar-user">
          <div className="emp-avatar">{(emp.name || emp.empId || 'E')[0].toUpperCase()}</div>
          <div>
            <div className="emp-user-name">{emp.name || 'Employee'}</div>
            <div className="emp-user-id">{emp.empId || ''}</div>
          </div>
        </div>
        <nav className="emp-sidebar-nav">
          {NAV.map((n, i) => {
            if (n.direct) return (
              <NavLink key={n.to} to={n.to} end={n.end}
                className={({ isActive }) => `emp-sidebar-link ${isActive ? 'active' : ''}`}
                onClick={() => setSidebarOpen(false)}>
                <span className="emp-sidebar-icon">{n.icon}</span>{n.label}
              </NavLink>
            )
            const isOpen    = openSections[i]
            const anyActive = n.children.some(c => location.pathname.startsWith(c.to))
            return (
              <div key={i} className="emp-nav-section">
                <button className={`emp-sidebar-link emp-sidebar-toggle ${anyActive ? 'active' : ''}`}
                  onClick={() => toggle(i)}>
                  <span className="emp-sidebar-icon">{n.icon}</span>
                  <span className="emp-toggle-label">{n.label}</span>
                  <span className={`emp-toggle-arrow ${isOpen ? 'open' : ''}`}>›</span>
                </button>
                {isOpen && (
                  <div className="emp-sub-links">
                    {n.children.map(c => (
                      <NavLink key={c.to} to={c.to}
                        className={({ isActive }) => `emp-sub-link ${isActive ? 'active' : ''}`}
                        onClick={() => setSidebarOpen(false)}>
                        <span className="emp-sub-star">★</span>{c.label}
                      </NavLink>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </nav>
        <div className="emp-sidebar-bottom">
          <Link to="/" className="emp-sidebar-link">🌐 View Website ↗</Link>
          <button className="emp-btn-logout" onClick={logout}>Log Out</button>
        </div>
      </aside>
      <main className="emp-main">
        <div className="emp-mobile-topbar">
          <button className="emp-hamburger" onClick={() => setSidebarOpen(o => !o)}>
            <span/><span/><span/>
          </button>
          <img src="/logo.png" alt="SMT" style={{width:"32px",height:"32px",objectFit:"contain"}} />
          <div className="emp-avatar emp-avatar-sm">{(emp.name || 'E')[0].toUpperCase()}</div>
        </div>
        <Outlet />
      </main>
    </div>
  )
}