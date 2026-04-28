import React from 'react'
import './Footer.css'

const LINKS = {
  Services: ['Web Development','Mobile Apps','Cloud Solutions','AI & Automation','Cybersecurity'],
  Company:  ['About Us','Portfolio','Technology','Careers','Blog'],
  Contact:  ['Get a Quote','Support','Partnerships','Email Us'],
}

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-grid">
        <div className="ft-brand">
          <a href="#" className="ft-logo">
            <img src="/logo.png" alt="SMT" style={{width:"36px",height:"36px",objectFit:"contain"}} />
            <span>Soft Master <em>Technology Solutions</em></span>
          </a>
          <p>
            Engineering world-class digital products for startups and enterprises.
            Headquartered in Vijayawada, building for the world.
          </p>
          <div className="ft-socials">
            {['in','tw','gh','yt'].map(s => (
              <a key={s} href="#" className="ft-soc" aria-label={s}>{s}</a>
            ))}
          </div>
        </div>

        {Object.entries(LINKS).map(([heading, items]) => (
          <div className="ft-col" key={heading}>
            <h4>{heading}</h4>
            <ul>
              {items.map(item => (
                <li key={item}>
                  <a href={heading === 'Services' ? '#services' : heading === 'Company' ? '#about' : '#contact'}>
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="ft-bottom">
        <p>© 2025 Soft Master Technology Solutions. All rights reserved.</p>
        <p className="ft-bottom-right">Made with ❤️ in Vijayawada, India</p>
      </div>
    </footer>
  )
}