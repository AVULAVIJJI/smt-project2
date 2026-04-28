import React from 'react'
import './About.css'

const FEATURES = [
  { icon:'⚡', title:'Agile Development',   desc:'2-week sprints, full transparency, and iterative delivery.' },
  { icon:'🎯', title:'Outcome-Focused',     desc:'Every decision aligned to your business goals.' },
  { icon:'🌍', title:'Global Delivery',     desc:'Remote-first team across time zones, available 24/7.' },
  { icon:'📊', title:'Data-Driven',         desc:'Analytics and user research behind every product decision.' },
]

const CHECKLIST = [
  'Startup speed with enterprise-grade engineering quality',
  'Dedicated project manager for every single client',
  'MongoDB Atlas free tier — zero database cost to start',
  'Transparent pricing, no hidden charges ever',
  '30-day post-launch support included in every project',
  'Full source code ownership transferred to you on completion',
]

export default function About() {
  return (
    <section id="about" className="about-section">
      <div className="about-wrap">

        {/* Visual card */}
        <div className="about-visual reveal-left">
          <div className="about-visual-line" />
          {FEATURES.map(f => (
            <div className="arow" key={f.title}>
              <div className="arow-icon">{f.icon}</div>
              <div>
                <h4>{f.title}</h4>
                <p>{f.desc}</p>
              </div>
            </div>
          ))}
          <div className="about-badge">
            <div className="ab-num">5★</div>
            <div>
              <strong>Average Client Rating</strong>
              <p>Across 150+ delivered projects</p>
            </div>
          </div>
        </div>

        {/* Text */}
        <div className="about-text reveal-right">
          <p className="eyebrow">Why Choose Us</p>
          <h2 className="sec-title">Built for Startups.<br /><em>Trusted by Enterprises.</em></h2>
          <p className="sec-desc">
            Soft Master Technology is headquartered in Vijayawada, Andhra Pradesh —
            40+ engineers building world-class software for fintech, healthtech, e-commerce,
            and SaaS clients globally.
          </p>
          <ul className="about-checklist">
            {CHECKLIST.map(c => (
              <li key={c}>
                <span className="check-dot">✓</span>
                {c}
              </li>
            ))}
          </ul>
          <a href="#contact" className="btn-primary" style={{ marginTop: 36 }}>
            Start Your Project →
          </a>
        </div>

      </div>
    </section>
  )
}
