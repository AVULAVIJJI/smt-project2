import React from 'react'
import './Services.css'

const SERVICES = [
  { n:'01', icon:'🌐', title:'Web Development',  tag:'React · Next.js · Node',      desc:'Blazing-fast websites and web apps built with React, Next.js, and Node.js — optimised for performance, SEO, and conversion.' },
  { n:'02', icon:'📱', title:'Mobile Apps',       tag:'Flutter · React Native',      desc:'Cross-platform iOS & Android apps with native performance. Flutter and React Native specialists delivering polished experiences.' },
  { n:'03', icon:'☁️', title:'Cloud Solutions',   tag:'AWS · Azure · GCP',           desc:'Scalable cloud infrastructure on AWS, Azure, and GCP with CI/CD pipelines, IaC, and 99.9% uptime SLA.' },
  { n:'04', icon:'🤖', title:'AI & Automation',   tag:'PyTorch · LangChain · GPT',   desc:'Custom AI models, LLM integrations, and intelligent workflow automation that transform business operations end-to-end.' },
  { n:'05', icon:'💡', title:'IT Consulting',     tag:'Strategy · Architecture',     desc:'Strategic technology roadmaps, CTO-as-a-service, and digital transformation advisory for startups and enterprises.' },
  { n:'06', icon:'🔒', title:'Cybersecurity',     tag:'SOC 2 · ISO 27001 · PenTest', desc:'Penetration testing, security audits, 24/7 threat monitoring, and compliance readiness for your digital assets.' },
]

export default function Services() {
  return (
    <section id="services" className="services-section">
      {/* Header */}
      <div className="svc-header reveal">
        <div>
          <p className="eyebrow">What We Do</p>
          <h2 className="sec-title">Services Built for<br /><em>Global Scale</em></h2>
        </div>
        <div className="svc-header-right">
          <p className="sec-desc">From idea to launch — we cover every layer of your technology stack with precision.</p>
          <a href="#contact" className="btn-primary" style={{ marginTop: 24 }}>Get a Free Quote →</a>
        </div>
      </div>

      {/* Grid */}
      <div className="svc-grid">
        {SERVICES.map(s => (
          <div className="svc-card reveal" key={s.n}>
            <div className="svc-top-bar" />
            <p className="svc-num">{s.n}</p>
            <div className="svc-icon">{s.icon}</div>
            <h3>{s.title}</h3>
            <p className="svc-desc">{s.desc}</p>
            <span className="svc-tag">{s.tag}</span>
            <a href="#contact" className="svc-more">Start a project →</a>
          </div>
        ))}
      </div>
    </section>
  )
}
