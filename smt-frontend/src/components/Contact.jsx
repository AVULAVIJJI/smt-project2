import React, { useState } from 'react'
import axios from 'axios'
import './Contact.css'

const INFO = [
  { icon: '✉️', label: 'Email',         value: 'Smtsolutions@smtssc.com' },
  { icon: '📞', label: 'Phone',         value: '+91 85009 10044'                },
  { icon: '📍', label: 'Location',      value: 'Indira Nagar Colony, Peerzadiguda, Hyderabad, Telangana 500098' },
  { icon: '🕐', label: 'Working Hours', value: 'Mon – Sat, 9:00 AM – 7:00 PM IST' },
]

const SERVICES = [
  'Web Development', 'Mobile Apps', 'Cloud Solutions',
  'AI & Automation', 'IT Consulting', 'Cybersecurity',
]

export default function Contact() {
  const [form, setForm]     = useState({ first_name:'', last_name:'', email:'', service:'', message:'' })
  const [status, setStatus] = useState(null)   // null | 'loading' | 'ok' | 'err'
  const [errMsg, setErrMsg] = useState('')

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async e => {
    e.preventDefault()
    if (!form.first_name || !form.email || !form.message) {
      setStatus('err'); setErrMsg('Please fill in all required fields.'); return
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      setStatus('err'); setErrMsg('Please enter a valid email address.'); return
    }
    setStatus('loading')
    try {
      // Save to localStorage for admin dashboard (remove when backend is ready)
      const contacts = JSON.parse(localStorage.getItem('smt_contacts') || '[]')
      contacts.push({ ...form, submittedAt: new Date().toISOString() })
      localStorage.setItem('smt_contacts', JSON.stringify(contacts))
      const res = await fetch("/api/contact", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) }).then(r => r.json())
      if (res.data.success) {
        setStatus('ok')
        setForm({ first_name:'', last_name:'', email:'', service:'', message:'' })
      }
    } catch {
      setStatus('err')
      setErrMsg('Something went wrong. Please try again or call us directly.')
    }
  }

  return (
    <section id="contact" className="contact-section">
      <div className="contact-wrap">

        {/* Left info */}
        <div className="contact-left reveal-left">
          <p className="eyebrow">Get In Touch</p>
          <h2 className="sec-title">Let's Build<br /><em>Something Great</em></h2>
          <p className="sec-desc">
            Tell us about your project. We respond within 24 hours with a clear plan and transparent pricing.
          </p>
          <div className="contact-info">
            {INFO.map(i => (
              <div className="ci-row" key={i.label}>
                <div className="ci-icon">{i.icon}</div>
                <div>
                  <p className="ci-label">{i.label}</p>
                  <strong className="ci-value">{i.value}</strong>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right form */}
        <div className="contact-form-wrap reveal-right">
          <div className="form-top-bar" />
          <h3 className="form-title">Send Us a Message</h3>
          <form className="cf" onSubmit={handleSubmit} noValidate>
            <div className="cf-row2">
              <div className="cf-group">
                <label>First Name *</label>
                <input name="first_name" value={form.first_name} onChange={handleChange} placeholder="John" />
              </div>
              <div className="cf-group">
                <label>Last Name</label>
                <input name="last_name" value={form.last_name} onChange={handleChange} placeholder="Doe" />
              </div>
            </div>
            <div className="cf-group">
              <label>Email Address *</label>
              <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="john@company.com" />
            </div>
            <div className="cf-group">
              <label>Service Interested In</label>
              <select name="service" value={form.service} onChange={handleChange}>
                <option value="">Select a service...</option>
                {SERVICES.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div className="cf-group">
              <label>Project Brief *</label>
              <textarea
                name="message" value={form.message}
                onChange={handleChange}
                placeholder="Tell us about your project — goals, timeline, and budget..."
              />
            </div>

            <button className="btn-submit" type="submit" disabled={status === 'loading'}>
              {status === 'loading' ? 'Sending...' : 'Send Message →'}
            </button>

            {status === 'ok' && (
              <div className="form-msg ok">✅ Message received! We'll get back to you within 24 hours.</div>
            )}
            {status === 'err' && (
              <div className="form-msg err">⚠️ {errMsg}</div>
            )}
          </form>
        </div>

      </div>
    </section>
  )
}
