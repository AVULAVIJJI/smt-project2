import React from 'react'
import './Tech.css'

const TECHS = [
  { name: 'React / Next.js',       color: '#61dafb' },
  { name: 'Node.js',               color: '#6cc24a' },
  { name: 'Python / FastAPI',       color: '#3776ab' },
  { name: 'TypeScript',            color: '#3178c6' },
  { name: 'React Native',          color: '#61dafb' },
  { name: 'Flutter',               color: '#54c5f8' },
  { name: 'MongoDB Atlas',         color: '#4db33d' },
  { name: 'PostgreSQL',            color: '#336791' },
  { name: 'AWS / Azure / GCP',     color: '#ff9900' },
  { name: 'Docker / Kubernetes',   color: '#2496ed' },
  { name: 'TensorFlow / PyTorch',  color: '#ff6f00' },
  { name: 'OpenAI / LangChain',    color: '#10a37f' },
  { name: 'GraphQL',               color: '#e10098' },
  { name: 'Terraform',             color: '#623ce4' },
  { name: 'Redis / Kafka',         color: '#dc382d' },
  { name: 'GitHub Actions CI/CD',  color: '#2088ff' },
]

export default function Tech() {
  return (
    <section id="tech" className="tech-section">
      <div className="tech-header reveal">
        <div>
          <p className="eyebrow">Our Stack</p>
          <h2 className="sec-title">Technologies We <em>Master</em></h2>
          <p className="sec-desc">
            We choose the right tool for every job — modern, proven, and built for scale.
          </p>
        </div>
      </div>

      <div className="tech-grid reveal">
        {TECHS.map(t => (
          <div className="tech-pill" key={t.name}>
            <span className="tech-dot" style={{ background: t.color }} />
            {t.name}
          </div>
        ))}
      </div>
    </section>
  )
}
