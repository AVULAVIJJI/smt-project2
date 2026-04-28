import React, { useState, useEffect } from 'react'
import { api } from '../../api'
import './Employee.css'

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']
const DAYS   = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']

export default function EmployeeAttendance() {
  const today   = new Date()
  const [year,  setYear]    = useState(today.getFullYear())
  const [month, setMonth]   = useState(today.getMonth())   // 0-indexed
  const [records,   setRecords]   = useState([])
  const [leaves,    setLeaves]    = useState([])
  const [todayRec,  setTodayRec]  = useState(null)
  const [loading,   setLoading]   = useState(true)
  const [acting,    setActing]    = useState(false)
  const [msg,       setMsg]       = useState('')

  const load = () => {
    setLoading(true)
    Promise.all([
      api.get('/employee/attendance'),
      api.get('/employee/attendance/today'),
      api.get('/employee/leaves'),
    ]).then(([recs, tod, leaveData]) => {
      setRecords(recs)
      setTodayRec(tod)
      setLeaves(leaveData.leaves || [])
      setLoading(false)
    }).catch(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const action = async (type) => {
    setActing(true); setMsg('')
    try {
      const res = await api.post('/employee/attendance/action', { action: type })
      setMsg(res.ok
        ? `✅ ${type === 'check_in' ? 'Checked In' : 'Checked Out'} at ${res.time}`
        : `⚠️ ${res.message}`)
      load()
    } catch (e) { setMsg('❌ ' + e.message) }
    finally { setActing(false) }
  }

  // ── Build calendar days ──────────────────────────────────────
  const firstDay  = new Date(year, month, 1).getDay()   // 0=Sun
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  // Map date string → status from attendance records
  const attMap = {}
  records.forEach(r => { attMap[r.date] = r })

  // Map leave date ranges → 'leave'
  const leaveMap = {}
  leaves.forEach(l => {
    if (l.status === 'Approved') {
      const from = new Date(l.from_date)
      const to   = new Date(l.to_date)
      for (let d = new Date(from); d <= to; d.setDate(d.getDate() + 1)) {
        leaveMap[d.toISOString().slice(0, 10)] = l.leave_type
      }
    }
  })

  const getDayStatus = (dayNum) => {
    const dateStr = `${year}-${String(month + 1).padStart(2,'0')}-${String(dayNum).padStart(2,'0')}`
    const dow = new Date(year, month, dayNum).getDay()
    if (dow === 0 || dow === 6) return 'weekend'
    if (leaveMap[dateStr])      return 'leave'
    if (attMap[dateStr])        return attMap[dateStr].status === 'present' ? 'present' : 'absent'
    const todayStr = today.toISOString().slice(0,10)
    if (dateStr > todayStr)     return 'future'
    if (dateStr === todayStr)   return todayRec?.status === 'present' ? 'present' : 'today'
    return 'absent'
  }

  const getDayInfo = (dayNum) => {
    const dateStr = `${year}-${String(month + 1).padStart(2,'0')}-${String(dayNum).padStart(2,'0')}`
    if (leaveMap[dateStr]) return leaveMap[dateStr]
    if (attMap[dateStr])   return attMap[dateStr].check_in ? `In: ${attMap[dateStr].check_in}` : ''
    return ''
  }

  const prevMonth = () => { if (month === 0) { setMonth(11); setYear(y => y-1) } else setMonth(m => m-1) }
  const nextMonth = () => { if (month === 11) { setMonth(0); setYear(y => y+1) } else setMonth(m => m+1) }

  // Stats
  const present  = records.filter(r => r.status === 'present').length
  const absent   = records.filter(r => r.status === 'absent').length
  const onLeave  = Object.keys(leaveMap).filter(d => d.startsWith(`${year}-${String(month+1).padStart(2,'0')}`)).length

  const STATUS_STYLE = {
    present: { bg: '#dcfce7', color: '#16a34a', label: 'Present' },
    absent:  { bg: '#fee2e2', color: '#dc2626', label: 'Absent'  },
    leave:   { bg: '#fef9c3', color: '#ca8a04', label: 'Leave'   },
    weekend: { bg: '#f1f5f9', color: '#94a3b8', label: 'Weekend' },
    today:   { bg: '#dbeafe', color: '#2563eb', label: 'Today'   },
    future:  { bg: '#fff',    color: '#cbd5e1', label: ''        },
  }

  return (
    <div className="emp-page">
      <div className="emp-page-header">
        <div><h1>Attendance</h1><p>Your monthly attendance calendar</p></div>
      </div>

      {/* Today check-in/out */}
      <div className="emp-section">
        <h2>Today — {today.toLocaleDateString('en-IN', { weekday:'long', day:'numeric', month:'long' })}</h2>
        {loading ? <p>Loading...</p> : (
          <div className="emp-attendance-today">
            <div className="emp-att-stat">
              <span>Check In</span>
              <strong>{todayRec?.check_in || '—'}</strong>
            </div>
            <div className="emp-att-stat">
              <span>Check Out</span>
              <strong>{todayRec?.check_out || '—'}</strong>
            </div>
            <div className="emp-att-stat">
              <span>Hours</span>
              <strong>{todayRec?.hours ? `${todayRec.hours}h` : '—'}</strong>
            </div>
            <div style={{display:'flex', gap:'10px', alignItems:'center'}}>
              {!todayRec?.check_in && (
                <button className="emp-btn-primary" disabled={acting} onClick={() => action('check_in')}>
                  {acting ? '...' : '🟢 Check In'}
                </button>
              )}
              {todayRec?.check_in && !todayRec?.check_out && (
                <button className="emp-btn-outline" disabled={acting} onClick={() => action('check_out')}>
                  {acting ? '...' : '🔴 Check Out'}
                </button>
              )}
              {todayRec?.check_in && todayRec?.check_out && (
                <span className="emp-badge badge-green">✅ Done for today</span>
              )}
            </div>
          </div>
        )}
        {msg && <div className="emp-success-banner" style={{marginTop:'10px'}}>{msg}</div>}
      </div>

      {/* Stats */}
      <div className="emp-stats-row">
        {[
          { label:'Present',       value: present,  icon:'✅', color:'#16a34a' },
          { label:'Absent',        value: absent,   icon:'❌', color:'#dc2626' },
          { label:'On Leave',      value: onLeave,  icon:'🌴', color:'#ca8a04' },
          { label:'Total Working', value: present + absent, icon:'📊', color:'#2563eb' },
        ].map(s => (
          <div className="emp-stat-card" key={s.label}>
            <div className="emp-stat-icon">{s.icon}</div>
            <div className="emp-stat-value" style={{color: s.color}}>{s.value}</div>
            <div className="emp-stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Calendar */}
      <div className="emp-section">
        {/* Calendar header */}
        <div className="att-cal-header">
          <button className="att-nav-btn" onClick={prevMonth}>‹ Prev</button>
          <h2 style={{margin:0}}>{MONTHS[month]} {year}</h2>
          <button className="att-nav-btn" onClick={nextMonth}>Next ›</button>
        </div>

        {/* Legend */}
        <div className="att-legend">
          {Object.entries(STATUS_STYLE).filter(([k]) => k !== 'future').map(([k, v]) => (
            <div className="att-legend-item" key={k}>
              <div className="att-legend-dot" style={{background: v.bg, border: `2px solid ${v.color}`}} />
              <span>{v.label}</span>
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="att-calendar">
          {/* Day headers */}
          {DAYS.map(d => (
            <div key={d} className="att-day-header">{d}</div>
          ))}

          {/* Empty cells before first day */}
          {Array.from({ length: firstDay }).map((_, i) => (
            <div key={`empty-${i}`} className="att-day-cell empty" />
          ))}

          {/* Day cells */}
          {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(dayNum => {
            const status = getDayStatus(dayNum)
            const info   = getDayInfo(dayNum)
            const style  = STATUS_STYLE[status] || STATUS_STYLE.future
            const isToday = dayNum === today.getDate() && month === today.getMonth() && year === today.getFullYear()
            return (
              <div
                key={dayNum}
                className={`att-day-cell ${status}`}
                style={{ background: style.bg, borderColor: style.color }}
              >
                <div className="att-day-num" style={{ color: isToday ? '#2563eb' : style.color, fontWeight: isToday ? 700 : 500 }}>
                  {dayNum}
                  {isToday && <span className="att-today-dot" />}
                </div>
                {info && <div className="att-day-info" style={{color: style.color}}>{info}</div>}
                {status !== 'future' && status !== 'weekend' && status !== 'today' && (
                  <div className="att-day-status" style={{color: style.color}}>{style.label}</div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}