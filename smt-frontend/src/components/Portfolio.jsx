import React from 'react'
import './Portfolio.css'

const PROJECTS = [
  {
    featured: true,
    thumb: '🏦', bg: 'grad-blue',
    tag: 'Fintech · Web Platform',
    title: 'PaySwift — Payments OS',
    desc: 'Real-time payment infrastructure with AI fraud detection, handling 50,000+ daily transactions across multiple currencies with 99.99% uptime.',
    tech: ['React', 'Node.js', 'MongoDB', 'AWS'],
  },
  {
    featured: false,
    thumb: '🏥', bg: 'grad-teal',
    tag: 'HealthTech · Mobile App',
    title: 'MedTrack — Clinic Platform',
    desc: 'HIPAA-compliant patient management and teleconsultation app deployed across 200+ clinics in South Asia.',
    tech: ['Flutter', 'FastAPI', 'PostgreSQL'],
  },
  {
    featured: false,
    thumb: '🛒', bg: 'grad-purple',
    tag: 'E-Commerce · Cloud',
    title: 'ShopEngine — Commerce Core',
    desc: 'Headless e-commerce engine with AI-powered recommendations serving 1M+ monthly users on AWS.',
    tech: ['Next.js', 'Python', 'MongoDB', 'AWS'],
  },
]

export default function Portfolio() {
  return (
    <section id="portfolio" className="port-section">
      <div className="port-header reveal">
        <p className="eyebrow">Our Work</p>
        <h2 className="sec-title">Recent <em>Projects</em></h2>
        <p className="sec-desc">Products we've designed, built, and shipped — made to last and scale.</p>
      </div>

      <div className="port-grid">
        {PROJECTS.map(p => (
          <div className={`port-card reveal ${p.featured ? 'featured' : ''}`} key={p.title}>
            <div className={`port-thumb ${p.bg}`}>
              <span className="port-emoji">{p.thumb}</span>
            </div>
            <div className="port-body">
              <p className="port-tag">{p.tag}</p>
              <h3>{p.title}</h3>
              <p className="port-desc">{p.desc}</p>
              <div className="port-techs">
                {p.tech.map(t => <span key={t} className="port-tech-badge">{t}</span>)}
              </div>
              <a href="#contact" className="port-link">View Case Study →</a>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
