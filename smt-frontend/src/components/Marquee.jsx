import React from 'react'
import './Marquee.css'

const ITEMS = [
  'Web Development','Mobile Apps','Cloud Solutions','AI & Automation',
  'IT Consulting','Cybersecurity','MongoDB Atlas','React & Next.js',
  'Flutter & Dart','Machine Learning','DevOps & CI/CD','Penetration Testing',
]

export default function Marquee() {
  const doubled = [...ITEMS, ...ITEMS]
  return (
    <div className="marquee-wrap" aria-hidden="true">
      <div className="marquee-track">
        {doubled.map((t, i) => (
          <span key={i} className="marquee-item">{t}</span>
        ))}
      </div>
    </div>
  )
}
