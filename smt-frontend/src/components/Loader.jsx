import React, { useEffect, useState } from 'react'
import './Loader.css'

export default function Loader() {
  const [progress, setProgress] = useState(0)
  const [gone, setGone]         = useState(false)

  useEffect(() => {
    const iv = setInterval(() => {
      setProgress(p => {
        const next = p + Math.random() * 20
        if (next >= 100) {
          clearInterval(iv)
          setTimeout(() => setGone(true), 700)
          return 100
        }
        return next
      })
    }, 80)
    return () => clearInterval(iv)
  }, [])

  if (gone) return null

  return (
    <div className={`loader ${progress >= 100 ? 'fade-out' : ''}`}>
      <div className="ld-ring" />
      <div className="ld-logo">
        Soft Master <span>Technology Solutions</span>
      </div>
      <div className="ld-track">
        <div className="ld-fill" style={{ width: `${Math.min(progress, 100)}%` }} />
      </div>
      <p className="ld-pct">{Math.floor(Math.min(progress, 100))}%</p>
    </div>
  )
}