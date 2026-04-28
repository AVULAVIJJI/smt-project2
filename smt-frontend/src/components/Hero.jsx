import React from 'react'
import './Hero.css'

const STATS = [
  { val: '150+', label: 'Projects Delivered' },
  { val: '98%',  label: 'Client Satisfaction' },
  { val: '40+',  label: 'Expert Engineers' },
  { val: '5+',   label: 'Years Innovating' },
]

export default function Hero() {
  return (
    <section className="hero" id="home">
      <div className="hero-inner">
        <div className="hero-badge">
          <span className="badge-dot" />
          India's Premier Software Company · Est. 2020
        </div>

        <h1 className="hero-h1">
          We Engineer<br />
          <span className="hero-gradient">World-Class</span><br />
          <em>Digital Products</em>
        </h1>

        <p className="hero-sub">
          Soft Master Technology Solutions delivers cutting-edge web platforms, mobile apps,
          cloud infrastructure, AI automation, IT consulting, and cybersecurity —
          built to compete with the best in the world.
        </p>

        <div className="hero-btns">
          <a href="#services" className="btn-primary">Explore Services →</a>
          <a href="#contact"  className="btn-outline">Schedule a Call</a>
        </div>

        <div className="hero-stats">
          {STATS.map(s => (
            <div className="hstat" key={s.label}>
              <div className="hstat-val">{s.val}</div>
              <div className="hstat-lbl">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}