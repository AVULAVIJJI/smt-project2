import React, { useEffect } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home              from './pages/Home'
import Careers           from './pages/Careers'
import AdminLogin        from './pages/admin/AdminLogin'
import AdminLayout       from './pages/admin/AdminLayout'
import Dashboard         from './pages/admin/Dashboard'
import Jobs              from './pages/admin/Jobs'
import Applications      from './pages/admin/Applications'
import Employees         from './pages/admin/Employees'
import Leaves            from './pages/admin/Leaves'
import Tasks             from './pages/admin/Tasks'
import Payslips          from './pages/admin/Payslips'
import Announcements     from './pages/admin/Announcements'
import EmployeeLogin         from './pages/employee/EmployeeLogin'
import EmployeeLayout        from './pages/employee/EmployeeLayout'
import EmployeeDashboard     from './pages/employee/EmployeeDashboard'
import EmployeePayslips      from './pages/employee/EmployeePayslips'
import EmployeeLeaves        from './pages/employee/EmployeeLeaves'
import EmployeeTasks         from './pages/employee/EmployeeTasks'
import EmployeeProfile       from './pages/employee/EmployeeProfile'
import EmployeeAttendance    from './pages/employee/EmployeeAttendance'
import EmployeeAnnouncements from './pages/employee/EmployeeAnnouncements'
import EmployeeITHelpdesk    from './pages/employee/EmployeeITHelpdesk'
import EmployeeReimbursement from './pages/employee/EmployeeReimbursement'
import SectionPage           from './pages/employee/SectionPage'

export default function App() {
  useEffect(() => {
    const obs = new IntersectionObserver((entries) => {
      entries.forEach((e, i) => {
        if (e.isIntersecting) {
          setTimeout(() => e.target.classList.add('in'), i * 80)
          obs.unobserve(e.target)
        }
      })
    }, { threshold: 0.08 })
    document.querySelectorAll('.reveal,.reveal-left,.reveal-right').forEach(el => obs.observe(el))
    return () => obs.disconnect()
  }, [])

  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/"        element={<Home />} />
        <Route path="/careers" element={<Careers />} />

        {/* Admin */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin"       element={<AdminLayout />}>
          <Route index                    element={<Dashboard />} />
          <Route path="jobs"              element={<Jobs />} />
          <Route path="applications"      element={<Applications />} />
          <Route path="employees"         element={<Employees />} />
          <Route path="leaves"            element={<Leaves />} />
          <Route path="tasks"             element={<Tasks />} />
          <Route path="payslips"          element={<Payslips />} />
          <Route path="announcements"     element={<Announcements />} />
        </Route>

        {/* Employee Portal */}
        <Route path="/employee/login" element={<EmployeeLogin />} />
        <Route path="/employee"       element={<EmployeeLayout />}>
          <Route index element={<EmployeeDashboard />} />

          {/* My Data */}
          <Route path="my-data/profile"    element={<EmployeeProfile />} />
          <Route path="my-data/payslips"   element={<EmployeePayslips />} />
          <Route path="my-data/attendance" element={<EmployeeAttendance />} />
          <Route path="my-data/documents"  element={<SectionPage />} />

          {/* HR */}
          <Route path="hr/leaves"     element={<EmployeeLeaves />} />
          <Route path="hr/policies"   element={<SectionPage />} />
          <Route path="hr/onboarding" element={<SectionPage />} />
          <Route path="hr/exit"       element={<SectionPage />} />
          <Route path="hr/grievance"  element={<SectionPage />} />

          {/* My Development */}
          <Route path="my-development/goals"       element={<SectionPage />} />
          <Route path="my-development/training"    element={<SectionPage />} />
          <Route path="my-development/performance" element={<SectionPage />} />
          <Route path="my-development/feedback"    element={<SectionPage />} />

          {/* Finance */}
          <Route path="finance/payslips"      element={<EmployeePayslips />} />
          <Route path="finance/reimbursement" element={<EmployeeReimbursement />} />
          <Route path="finance/tax"           element={<SectionPage />} />
          <Route path="finance/advances"      element={<SectionPage />} />

          {/* IT */}
          <Route path="it/helpdesk" element={<EmployeeITHelpdesk />} />
          <Route path="it/assets"   element={<SectionPage />} />
          <Route path="it/software" element={<SectionPage />} />
          <Route path="it/access"   element={<SectionPage />} />

          {/* Misc */}
          <Route path="misc/announcements" element={<EmployeeAnnouncements />} />
          <Route path="misc/directory"     element={<SectionPage />} />
          <Route path="misc/links"         element={<SectionPage />} />

          {/* Quality */}
          <Route path="quality/iso"       element={<SectionPage />} />
          <Route path="quality/audits"    element={<SectionPage />} />
          <Route path="quality/ncr"       element={<SectionPage />} />
          <Route path="quality/documents" element={<SectionPage />} />

          {/* Revenue Assurance */}
          <Route path="revenue-assurance/reports"  element={<SectionPage />} />
          <Route path="revenue-assurance/controls" element={<SectionPage />} />
          <Route path="revenue-assurance/leakage"  element={<SectionPage />} />

          {/* MIS */}
          <Route path="mis/dashboard" element={<SectionPage />} />
          <Route path="mis/reports"   element={<SectionPage />} />
          <Route path="mis/analytics" element={<SectionPage />} />

          {/* Admin-Facilities */}
          <Route path="admin-facilities/assets"    element={<SectionPage />} />
          <Route path="admin-facilities/travel"    element={<SectionPage />} />
          <Route path="admin-facilities/cab"       element={<SectionPage />} />
          <Route path="admin-facilities/cafeteria" element={<SectionPage />} />
          <Route path="admin-facilities/helpdesk"  element={<SectionPage />} />

          {/* CMO */}
          <Route path="cmo/brand"     element={<SectionPage />} />
          <Route path="cmo/campaigns" element={<SectionPage />} />
          <Route path="cmo/events"    element={<SectionPage />} />

          {/* Procurement */}
          <Route path="procurement/purchase"  element={<SectionPage />} />
          <Route path="procurement/vendors"   element={<SectionPage />} />
          <Route path="procurement/contracts" element={<SectionPage />} />

          {/* Privacy & IS */}
          <Route path="privacy-is/policies"  element={<SectionPage />} />
          <Route path="privacy-is/gdpr"      element={<SectionPage />} />
          <Route path="privacy-is/incidents" element={<SectionPage />} />
          <Route path="privacy-is/training"  element={<SectionPage />} />

          {/* Favourites */}
          <Route path="favourites/acceptable-use-policy" element={<SectionPage />} />
          <Route path="favourites/business-continuity"   element={<SectionPage />} />
          <Route path="favourites/cyber-shield"          element={<SectionPage />} />
          <Route path="favourites/data-privacy"          element={<SectionPage />} />
          <Route path="favourites/data-retention"        element={<SectionPage />} />
          <Route path="favourites/incident-escalation"   element={<SectionPage />} />

          {/* Direct */}
          <Route path="tasks"    element={<EmployeeTasks />} />
          <Route path="hr/tasks" element={<EmployeeTasks />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}