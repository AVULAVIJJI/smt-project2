import React from 'react'
import { useLocation, Link } from 'react-router-dom'
import './Employee.css'

// Page configs per route segment
const PAGE_CONFIG = {
  // Favourites
  'acceptable-use-policy':    { title: 'Acceptable Use Policy',               icon: '📜', section: 'Favourites', desc: 'Guidelines for acceptable use of company IT systems, networks, and data.' },
  'business-continuity':      { title: 'Business Continuity Management System',icon: '🔄', section: 'Favourites', desc: 'Policies and procedures to ensure operations continue during disruptions.' },
  'cyber-shield':             { title: 'Cyber Shield',                         icon: '🛡️', section: 'Favourites', desc: 'Cybersecurity framework and tools protecting company and client data.' },
  'data-privacy':             { title: 'Data Privacy Framework',               icon: '🔐', section: 'Favourites', desc: 'How we collect, process, and protect personal data across all operations.' },
  'data-retention':           { title: 'Data Retention Policy',                icon: '📂', section: 'Favourites', desc: 'Rules governing how long data is stored and when it must be deleted.' },
  'incident-escalation':      { title: 'Incident Escalation Framework',        icon: '🚨', section: 'Favourites', desc: 'Step-by-step escalation procedures for reporting and handling incidents.' },
  // My Data
  'profile':                  { title: 'My Profile',         icon: '👤', section: 'My Data',        desc: 'View and update your personal and professional information.' },
  'payslips':                 { title: 'Pay Slips',          icon: '💰', section: 'My Data / Finance', desc: 'Download your monthly salary statements.' },
  'documents':                { title: 'My Documents',       icon: '📄', section: 'My Data',        desc: 'Access your employment letters, certificates, and other documents.' },
  'attendance':               { title: 'Attendance',         icon: '🕐', section: 'My Data',        desc: 'View your attendance records, login/logout times and regularization.' },
  // My Development
  'goals':                    { title: 'My Goals',           icon: '🎯', section: 'My Development', desc: 'Set, track and update your quarterly and annual performance goals.' },
  'training':                 { title: 'Training & Courses', icon: '📚', section: 'My Development', desc: 'Browse and enroll in training programs and certification courses.' },
  'performance':              { title: 'Performance Review', icon: '📊', section: 'My Development', desc: 'View your performance appraisals and ratings history.' },
  'feedback':                 { title: 'Feedback',           icon: '💬', section: 'My Development', desc: 'Give and receive 360° feedback from peers, managers and reports.' },
  // HR
  'leaves':                   { title: 'Leave Tracker',      icon: '📅', section: 'HR',             desc: 'Apply for leave, track balances and view approval status.' },
  'policies':                 { title: 'HR Policies',        icon: '📋', section: 'HR',             desc: 'Access all HR policies including leave, travel, and conduct guidelines.' },
  'onboarding':               { title: 'Onboarding',         icon: '🤝', section: 'HR',             desc: 'Onboarding checklist, resources and induction materials.' },
  'exit':                     { title: 'Exit Formalities',   icon: '🚪', section: 'HR',             desc: 'Resignation process, clearance checklist and full-and-final settlement.' },
  'grievance':                { title: 'Grievance',          icon: '📝', section: 'HR',             desc: 'Raise and track workplace grievances confidentially.' },
  // Quality
  'iso':                      { title: 'ISO Standards',      icon: '🏆', section: 'Quality',        desc: 'ISO 9001, 27001, and other applicable standards and their requirements.' },
  'audits':                   { title: 'Audits',             icon: '🔍', section: 'Quality',        desc: 'Internal and external audit schedules, findings and closure status.' },
  'ncr':                      { title: 'NCR Tracker',        icon: '⚠️', section: 'Quality',        desc: 'Non-conformance report tracker — raise, assign and close NCRs.' },
  // Revenue Assurance
  'reports':                  { title: 'Reports',            icon: '📈', section: 'Revenue Assurance / MIS', desc: 'Access periodic revenue assurance and MIS reports.' },
  'controls':                 { title: 'Controls',           icon: '🎛️', section: 'Revenue Assurance', desc: 'Revenue assurance control framework and check status.' },
  'leakage':                  { title: 'Leakage Tracker',   icon: '🔎', section: 'Revenue Assurance', desc: 'Identify, track and resolve revenue leakage items.' },
  // MIS
  'dashboard':                { title: 'MIS Dashboard',      icon: '🖥️', section: 'MIS',            desc: 'Real-time operational metrics and KPIs across departments.' },
  'analytics':                { title: 'Analytics',          icon: '📉', section: 'MIS',            desc: 'Deep-dive analytics and trend analysis reports.' },
  // Finance
  'reimbursement':            { title: 'Reimbursement',      icon: '💳', section: 'Finance',        desc: 'Submit and track expense reimbursement claims.' },
  'tax':                      { title: 'Tax Declaration',    icon: '🧾', section: 'Finance',        desc: 'Submit your investment proofs and tax declarations for the year.' },
  'advances':                 { title: 'Advances',           icon: '💵', section: 'Finance',        desc: 'Apply for salary advances and track repayment status.' },
  // Admin-Facilities
  'assets':                   { title: 'Asset Management',   icon: '💻', section: 'Admin-Facilities / IT', desc: 'View assets assigned to you and raise asset requests.' },
  'travel':                   { title: 'Travel Desk',        icon: '✈️', section: 'Admin-Facilities', desc: 'Book flights, hotels and get travel approvals.' },
  'cab':                      { title: 'Cab Booking',        icon: '🚖', section: 'Admin-Facilities', desc: 'Book office cabs for commute and client visits.' },
  'cafeteria':                { title: 'Cafeteria',          icon: '🍱', section: 'Admin-Facilities', desc: 'View today\'s menu and pre-order cafeteria meals.' },
  'helpdesk':                 { title: 'Helpdesk',           icon: '🎧', section: 'Admin-Facilities / IT', desc: 'Raise and track support tickets for admin or IT issues.' },
  // CMO
  'brand':                    { title: 'Brand Assets',       icon: '🎨', section: 'CMO',            desc: 'Download logos, templates, brand guidelines and marketing materials.' },
  'campaigns':                { title: 'Campaigns',          icon: '📣', section: 'CMO',            desc: 'Track ongoing marketing campaigns and performance metrics.' },
  'events':                   { title: 'Events',             icon: '🎉', section: 'CMO',            desc: 'Company events calendar, registrations and post-event reports.' },
  // IT
  'software':                 { title: 'Software Requests',  icon: '💿', section: 'IT',             desc: 'Request installation of software or licenses for your work.' },
  'access':                   { title: 'Access Management',  icon: '🔑', section: 'IT',             desc: 'Request or revoke access to systems, tools and shared drives.' },
  // Procurement
  'purchase':                 { title: 'Purchase Requests',  icon: '🛒', section: 'Procurement',    desc: 'Raise purchase orders and track approval status.' },
  'vendors':                  { title: 'Vendor Management',  icon: '🤝', section: 'Procurement',    desc: 'Approved vendor list, onboarding and evaluation.' },
  'contracts':                { title: 'Contracts',          icon: '📃', section: 'Procurement',    desc: 'View and manage vendor and client contracts.' },
  // Privacy & IS
  'gdpr':                     { title: 'GDPR Compliance',    icon: '🇪🇺', section: 'Privacy & IS',  desc: 'GDPR obligations, data subject requests and compliance tracker.' },
  'incidents':                { title: 'Incident Reporting', icon: '🚨', section: 'Privacy & IS',  desc: 'Report and track information security incidents.' },
  // Misc
  'links':                    { title: 'Useful Links',       icon: '🔗', section: 'Misc',           desc: 'Quick access to important internal and external tools and portals.' },
  'announcements':            { title: 'Announcements',      icon: '📢', section: 'Misc',           desc: 'Company-wide announcements and important notices.' },
  'directory':                { title: 'Employee Directory', icon: '👥', section: 'Misc',           desc: 'Find colleagues by name, team, or department.' },
}

const COMING_SOON_COMPONENTS = {
  'directory': DirectoryPage,
  'announcements': AnnouncementsPage,
  'links': LinksPage,
}

function DirectoryPage() {
  const TEAM = [
    { name: 'Ravi Kumar',    role: 'Full Stack Developer', dept: 'Engineering', email: 'ravi@smt.com',    phone: '+91 98765 43210' },
    { name: 'Priya Sharma',  role: 'UI/UX Designer',       dept: 'Design',      email: 'priya@smt.com',   phone: '+91 98765 43211' },
    { name: 'Arun Reddy',    role: 'DevOps Engineer',       dept: 'Cloud',       email: 'arun@smt.com',    phone: '+91 98765 43212' },
    { name: 'Meena Nair',    role: 'HR Manager',            dept: 'HR',          email: 'meena@smt.com',   phone: '+91 98765 43213' },
    { name: 'Sai Krishna',   role: 'Flutter Developer',     dept: 'Mobile',      email: 'sai@smt.com',     phone: '+91 98765 43214' },
    { name: 'Deepa Thomas',  role: 'AI/ML Engineer',        dept: 'AI',          email: 'deepa@smt.com',   phone: '+91 98765 43215' },
  ]
  return (
    <div className="emp-dir-grid">
      {TEAM.map(p => (
        <div className="emp-dir-card" key={p.email}>
          <div className="emp-dir-avatar">{p.name[0]}</div>
          <div className="emp-dir-name">{p.name}</div>
          <div className="emp-dir-role">{p.role}</div>
          <div className="emp-dir-dept">{p.dept}</div>
          <div className="emp-dir-contact">
            <span>✉ {p.email}</span>
            <span>📞 {p.phone}</span>
          </div>
        </div>
      ))}
    </div>
  )
}

function AnnouncementsPage() {
  const items = [
    { tag: 'Holiday',  title: 'Office Holiday on April 14 — Dr. Ambedkar Jayanti',     date: '28 Mar 2026' },
    { tag: 'HR',       title: 'Q1 Performance Reviews start April 1st',                 date: '25 Mar 2026' },
    { tag: 'Project',  title: 'New Project Kickoff: Client Portal v2 — All hands call', date: '20 Mar 2026' },
    { tag: 'IT',       title: 'System maintenance scheduled March 30, 11pm–2am',        date: '18 Mar 2026' },
    { tag: 'Finance',  title: 'Investment proof submission deadline: March 31',          date: '15 Mar 2026' },
  ]
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {items.map((a, i) => (
        <div className="emp-announcement-card" key={i}>
          <div className="emp-ann-tag">{a.tag}</div>
          <div className="emp-ann-title">{a.title}</div>
          <div className="emp-ann-date">{a.date}</div>
        </div>
      ))}
    </div>
  )
}

function LinksPage() {
  const links = [
    { label: 'HRMS Portal',        url: '#', icon: '👤' },
    { label: 'Jira / Project Mgmt',url: '#', icon: '📋' },
    { label: 'Confluence Wiki',     url: '#', icon: '📖' },
    { label: 'GitHub Org',          url: '#', icon: '💻' },
    { label: 'AWS Console',         url: '#', icon: '☁️' },
    { label: 'Figma Workspace',     url: '#', icon: '🎨' },
    { label: 'Slack Workspace',     url: '#', icon: '💬' },
    { label: 'Google Workspace',    url: '#', icon: '📧' },
  ]
  return (
    <div className="emp-links-grid">
      {links.map(l => (
        <a key={l.label} href={l.url} className="emp-link-card">
          <span className="emp-link-icon">{l.icon}</span>
          <span className="emp-link-label">{l.label}</span>
          <span className="emp-link-arrow">↗</span>
        </a>
      ))}
    </div>
  )
}

export default function SectionPage() {
  const location = useLocation()
  const segment  = location.pathname.split('/').pop()
  const cfg      = PAGE_CONFIG[segment] || { title: segment, icon: '📄', section: '', desc: 'This section is under construction.' }

  const CustomComponent = COMING_SOON_COMPONENTS[segment]

  return (
    <div className="emp-page">
      <div className="emp-page-header">
        <div>
          <div className="emp-breadcrumb">
            <Link to="/employee">Dashboard</Link> › {cfg.section} › {cfg.title}
          </div>
          <h1>{cfg.icon} {cfg.title}</h1>
          <p>{cfg.desc}</p>
        </div>
      </div>

      {CustomComponent ? (
        <div className="emp-section"><CustomComponent /></div>
      ) : (
        <div className="emp-coming-soon-box">
          <div className="emp-coming-icon">{cfg.icon}</div>
          <h3>{cfg.title}</h3>
          <p>This module is being set up. Connect your backend API to populate this section with live data.</p>
          <div className="emp-coming-actions">
            <Link to="/employee" className="emp-btn-primary">← Back to Dashboard</Link>
          </div>
        </div>
      )}
    </div>
  )
}
