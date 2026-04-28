import React, { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import './Navbar.css'

const NAV_LINKS = [
  { label: 'Services',   href: '#services',  section: 'services'  },
  { label: 'About',      href: '#about',     section: 'about'     },
  { label: 'Technology', href: '#tech',      section: 'tech'      },
  { label: 'Portfolio',  href: '#portfolio', section: 'portfolio' },
  { label: 'Contact',    href: '#contact',   section: 'contact'   },
  { label: 'Careers',    href: '/careers',   section: null        },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [active,   setActive]   = useState('')
  const [menuOpen, setMenuOpen] = useState(false)
  const location   = useLocation()
  const navigate   = useNavigate()
  const isHome     = location.pathname === '/'

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 60)
      if (!isHome) return
      const sections = document.querySelectorAll('section[id]')
      let cur = ''
      sections.forEach(s => { if (window.scrollY >= s.offsetTop - 90) cur = s.id })
      setActive(cur)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [isHome])

  const handleNavClick = (e, link) => {
    if (link.section === null) return
    e.preventDefault()
    setMenuOpen(false)
    if (isHome) {
      const el = document.querySelector(link.href)
      if (el) el.scrollIntoView({ behavior: 'smooth' })
    } else {
      navigate('/' + link.href)
    }
  }

  const handleGetStarted = (e) => {
    e.preventDefault()
    setMenuOpen(false)
    if (isHome) {
      const el = document.querySelector('#contact')
      if (el) el.scrollIntoView({ behavior: 'smooth' })
    } else {
      navigate('/#contact')
    }
  }

  return (
    <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      <Link to="/" className="nav-logo">
        <img src="/logo.png" alt="SMT" style={{width:'36px',height:'36px',objectFit:'contain'}} />
        <span>Soft Master <em>Technology Solutions</em></span>
      </Link>

      <ul className="nav-links">
        {NAV_LINKS.map(l => (
          <li key={l.href}>
            {l.section === null ? (
              <Link to={l.href} className={`nav-link ${location.pathname === l.href ? 'active' : ''}`}>
                {l.label}
              </Link>
            ) : (
              <a href={l.href} onClick={e => handleNavClick(e, l)}
                className={`nav-link ${active === l.section ? 'active' : ''}`}>
                {l.label}
              </a>
            )}
          </li>
        ))}
        <li>
          <a href="#contact" className="nav-cta" onClick={handleGetStarted}>Get Started</a>
        </li>
        <li>
          <Link to="/employee/login" className="nav-profile-btn" title="Employee Portal">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
          </Link>
        </li>
      </ul>

      <button className={`hamburger ${menuOpen ? 'open' : ''}`}
        onClick={() => setMenuOpen(o => !o)} aria-label="Toggle menu">
        <span /><span /><span />
      </button>

      {menuOpen && (
        <div className="mobile-menu">
          {NAV_LINKS.map(l => (
            l.section === null ? (
              <Link key={l.href} to={l.href} className="mobile-link" onClick={() => setMenuOpen(false)}>
                {l.label}
              </Link>
            ) : (
              <a key={l.href} href={l.href} className="mobile-link" onClick={e => handleNavClick(e, l)}>
                {l.label}
              </a>
            )
          ))}
          <a href="#contact" className="nav-cta mobile-cta" onClick={handleGetStarted}>Get Started</a>
          <Link to="/employee/login" className="mobile-link" onClick={() => setMenuOpen(false)}>
            👤 Employee Portal
          </Link>
        </div>
      )}
    </nav>
  )
}