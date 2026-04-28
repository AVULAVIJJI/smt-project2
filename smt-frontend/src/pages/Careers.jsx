import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { api } from '../api'
import './Careers.css'

const STATIC_JOBS = [
  { id:'s1', title:'Full Stack Developer',     dept:'Engineering',  location:'Vijayawada / Remote', type:'Full-Time',  experience:'2–4 years',  description:'Build scalable web apps using React, Node.js, and MongoDB.' },
  { id:'s2', title:'Flutter Developer',        dept:'Mobile',       location:'Vijayawada / Remote', type:'Full-Time',  experience:'1–3 years',  description:'Develop cross-platform mobile apps for iOS and Android.' },
  { id:'s3', title:'Python / FastAPI Backend', dept:'Engineering',  location:'Remote',              type:'Full-Time',  experience:'2–5 years',  description:'Design and build REST APIs and manage cloud deployments.' },
  { id:'s4', title:'UI/UX Designer',           dept:'Design',       location:'Vijayawada',          type:'Full-Time',  experience:'1–3 years',  description:'Create stunning interfaces for web and mobile products.' },
  { id:'s5', title:'DevOps Engineer',          dept:'Cloud',        location:'Remote',              type:'Full-Time',  experience:'3–5 years',  description:'Manage CI/CD pipelines, Docker, Kubernetes and cloud infra.' },
  { id:'s6', title:'AI/ML Engineer',           dept:'AI',           location:'Remote',              type:'Full-Time',  experience:'2–4 years',  description:'Build and deploy ML models and AI-powered automation.' },
  { id:'s7', title:'React.js Intern',          dept:'Engineering',  location:'Vijayawada',          type:'Internship', experience:'Fresher',    description:'Learn by building real projects. Strong JS fundamentals needed.' },
  { id:'s8', title:'Business Development Exec',dept:'Sales',        location:'Vijayawada',          type:'Full-Time',  experience:'1–2 years',  description:'Generate leads and manage client relationships.' },
]

const DEPTS = ['All','Engineering','Mobile','Design','Cloud','AI','Sales']
const TYPES = ['All','Full-Time','Internship']

function ApplyModal({ job, onClose }) {
  const [form, setForm]        = useState({ name:'', email:'', phone:'', role:job.title, experience:'', portfolio:'', message:'' })
  const [submitted, setSubmit] = useState(false)
  const [saving, setSaving]    = useState(false)

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async e => {
    e.preventDefault()
    if (!form.name || !form.email || !form.phone) return
    setSaving(true)
    try {
      await api.post('/applications', { ...form, job_id: typeof job.id === 'number' ? job.id : null })
      setSubmit(true)
    } catch (err) { alert(err.message) }
    finally { setSaving(false) }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>
        {submitted ? (
          <div className="modal-success">
            <div className="success-icon">✓</div>
            <h3>Application Submitted!</h3>
            <p>Thanks <strong>{form.name}</strong>! We'll review your application for <strong>{job.title}</strong> and get back to you within 3–5 business days.</p>
            <button className="btn-close-modal" onClick={onClose}>Close</button>
          </div>
        ) : (
          <>
            <div className="modal-head">
              <div>
                <h3>Apply for {job.title}</h3>
                <p>{job.dept} · {job.type} · {job.location}</p>
              </div>
              <button className="modal-x" onClick={onClose}>✕</button>
            </div>
            <form className="apply-form" onSubmit={handleSubmit}>
              <div className="af-row">
                <div className="af-group"><label>Full Name *</label>
                  <input name="name" value={form.name} onChange={handleChange} required /></div>
                <div className="af-group"><label>Email *</label>
                  <input name="email" type="email" value={form.email} onChange={handleChange} required /></div>
              </div>
              <div className="af-row">
                <div className="af-group"><label>Phone *</label>
                  <input name="phone" value={form.phone} onChange={handleChange} required /></div>
                <div className="af-group"><label>Experience</label>
                  <input name="experience" value={form.experience} onChange={handleChange} /></div>
              </div>
              <div className="af-group"><label>Portfolio / GitHub / LinkedIn</label>
                <input name="portfolio" value={form.portfolio} onChange={handleChange} /></div>
              <div className="af-group"><label>Why do you want to join SMT?</label>
                <textarea name="message" value={form.message} onChange={handleChange} /></div>
              <button type="submit" className="btn-apply-submit" disabled={saving}>
                {saving ? 'Submitting...' : 'Submit Application →'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}

export default function Careers() {
  const [dept,      setDept]   = useState('All')
  const [type,      setType]   = useState('All')
  const [search,    setSearch] = useState('')
  const [activeJob, setActive] = useState(null)
  const [dbJobs,    setDbJobs] = useState([])

  useEffect(() => {
    api.get('/jobs')
      .then(data => setDbJobs(data))
      .catch(() => {})
  }, [])

  const JOBS = [...STATIC_JOBS, ...dbJobs]

  const filtered = JOBS.filter(j => {
    const matchDept   = dept === 'All' || j.dept === dept
    const matchType   = type === 'All' || j.type === type
    const matchSearch = j.title.toLowerCase().includes(search.toLowerCase()) ||
                        (j.dept||'').toLowerCase().includes(search.toLowerCase())
    return matchDept && matchType && matchSearch
  })

  return (
    <>
      <Navbar />
      <div className="careers-page">
        <div className="careers-hero">
          <div className="careers-hero-inner">
            <Link to="/" className="careers-back-btn">← Back to Home</Link>
            <span className="careers-badge">We're Hiring</span>
            <h1>Build the Future<br /><em>With Us</em></h1>
            <p>Join Soft Master Technology and work on real-world projects.</p>
            <div className="careers-stats">
              <div><strong>{JOBS.length}+</strong><span>Open Roles</span></div>
              <div><strong>40+</strong><span>Team Members</span></div>
              <div><strong>Remote</strong><span>Friendly</span></div>
              <div><strong>5★</strong><span>Work Culture</span></div>
            </div>
          </div>
        </div>

        <div className="careers-filters">
          <input className="careers-search" placeholder="Search roles..." value={search} onChange={e => setSearch(e.target.value)} />
          <div className="filter-group">
            {DEPTS.map(d => <button key={d} className={`filter-btn ${dept===d?'active':''}`} onClick={() => setDept(d)}>{d}</button>)}
          </div>
          <div className="filter-group">
            {TYPES.map(t => <button key={t} className={`filter-btn ${type===t?'active':''}`} onClick={() => setType(t)}>{t}</button>)}
          </div>
        </div>

        <div className="jobs-wrap">
          <p className="jobs-count">{filtered.length} role{filtered.length !== 1 ? 's' : ''} found</p>
          <div className="jobs-grid">
            {filtered.map(job => (
              <div className="job-card" key={job.id}>
                <div className="job-card-top">
                  <div>
                    <span className={`job-type-badge ${job.type==='Internship'?'intern':''}`}>{job.type}</span>
                    <h3>{job.title}</h3>
                    <p className="job-meta">{job.dept} · {job.location} · {job.experience}</p>
                  </div>
                </div>
                <p className="job-desc">{job.description}</p>
                <div className="job-card-footer">
                  <div className="job-tags">
                    <span className="job-tag">{job.dept}</span>
                    <span className="job-tag">{job.experience}</span>
                  </div>
                  <button className="btn-apply" onClick={() => setActive(job)}>Apply Now →</button>
                </div>
              </div>
            ))}
          </div>
          {filtered.length === 0 && <div className="no-jobs"><p>No roles found for your search.</p></div>}
        </div>

        <div className="perks-section">
          <h2>Why Work at <em>Soft Master Technology?</em></h2>
          <div className="perks-grid">
            {[
              { icon:'🚀', title:'Real Projects',    desc:'Work on live client products from day one.' },
              { icon:'💰', title:'Competitive Pay',  desc:'Market-rate salaries with performance bonuses.' },
              { icon:'🌍', title:'Remote Friendly',  desc:'Most roles offer full remote or hybrid working.' },
              { icon:'📚', title:'Learning Budget',  desc:'Annual budget for courses and certifications.' },
              { icon:'🏥', title:'Health Benefits',  desc:'Health insurance for you and your family.' },
              { icon:'⚡', title:'Fast Growth',      desc:'Clear career paths based on merit, not tenure.' },
            ].map(p => (
              <div className="perk-card" key={p.title}>
                <div className="perk-icon">{p.icon}</div>
                <h4>{p.title}</h4>
                <p>{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
      <Footer />
      {activeJob && <ApplyModal job={activeJob} onClose={() => setActive(null)} />}
    </>
  )
}
