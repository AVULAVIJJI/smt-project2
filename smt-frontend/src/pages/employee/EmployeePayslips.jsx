import React, { useState, useEffect } from 'react'
import { api } from '../../api'
import './Employee.css'

export default function EmployeePayslips() {
  const [payslips,     setPayslips]     = useState([])
  const [loading,      setLoading]      = useState(true)
  const [downloading,  setDownloading]  = useState(null)  // payslip id being downloaded

  useEffect(() => {
    api.get('/employee/payslips')
      .then(data => { setPayslips(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const downloadPayslip = async (payslip) => {
    setDownloading(payslip.id)
    try {
      const token = localStorage.getItem('smt_token')
      const res = await fetch(`/api/employee/payslips/${payslip.id}/download`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (!res.ok) {
        const err = await res.text()
        alert('Download failed: ' + (err || 'Unknown error'))
        return
      }
      const blob = await res.blob()
      const url  = URL.createObjectURL(blob)
      const a    = document.createElement('a')
      a.href     = url
      a.download = `Payslip_${payslip.month_label.replace(/\s+/g,'_')}.pdf`
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)
    } catch (e) {
      alert('Download failed. Please try again.')
    } finally {
      setDownloading(null)
    }
  }

  return (
    <div className="emp-page">
      <div className="emp-page-header">
        <div><h1>Pay Slips</h1><p>Your monthly salary statements</p></div>
      </div>
      <div className="emp-table-wrap">
        <table className="emp-table">
          <thead>
            <tr>
              <th>Month</th>
              <th>Gross Pay</th>
              <th>Deductions</th>
              <th>Net Pay</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="6" style={{textAlign:'center'}}>Loading...</td></tr>
            ) : payslips.length === 0 ? (
              <tr><td colSpan="6" style={{textAlign:'center'}}>No payslips found.</td></tr>
            ) : payslips.map(p => (
              <tr key={p.id}>
                <td><strong>{p.month_label}</strong></td>
                <td>₹{Number(p.gross_pay).toLocaleString()}</td>
                <td className="emp-red">₹{Number(p.deductions).toLocaleString()}</td>
                <td className="emp-green"><strong>₹{Number(p.net_pay).toLocaleString()}</strong></td>
                <td>
                  <span className={`emp-badge ${p.status === 'Paid' ? 'badge-green' : 'badge-yellow'}`}>
                    {p.status}
                  </span>
                </td>
                <td>
                  {p.status === 'Paid' ? (
                    <button
                      className="emp-btn-sm"
                      disabled={downloading === p.id}
                      onClick={() => downloadPayslip(p)}
                    >
                      {downloading === p.id ? '⏳ Downloading...' : '⬇ Download PDF'}
                    </button>
                  ) : (
                    <span className="emp-muted">Pending payment</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
