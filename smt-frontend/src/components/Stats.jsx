import React, { useEffect, useRef, useState } from 'react'
import './Stats.css'

const STATS = [
  { target: 150, suffix: '+', label: 'Projects Delivered'  },
  { target: 98,  suffix: '%', label: 'Client Satisfaction' },
  { target: 40,  suffix: '+', label: 'Expert Engineers'    },
  { target: 5,   suffix: '+', label: 'Years Innovating'    },
]

function Counter({ target, suffix }) {
  const [count, setCount]   = useState(0)
  const [active, setActive] = useState(false)
  const ref = useRef()

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setActive(true); obs.disconnect() }
    }, { threshold: 0.4 })
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [])

  useEffect(() => {
    if (!active) return
    let v = 0
    const step = target / 55
    const iv = setInterval(() => {
      v = Math.min(v + step, target)
      setCount(Math.floor(v))
      if (v >= target) clearInterval(iv)
    }, 22)
    return () => clearInterval(iv)
  }, [active, target])

  return (
    <span ref={ref}>
      {count}<span className="stat-suffix">{suffix}</span>
    </span>
  )
}

export default function Stats() {
  return (
    <div className="stats-strip">
      {STATS.map(s => (
        <div className="stat-cell" key={s.label}>
          <div className="stat-val">
            <Counter target={s.target} suffix={s.suffix} />
          </div>
          <div className="stat-lbl">{s.label}</div>
        </div>
      ))}
    </div>
  )
}
