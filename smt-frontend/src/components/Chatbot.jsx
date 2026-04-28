import React, { useState, useRef, useEffect } from 'react'
import './Chatbot.css'

const QUICK = ['Our Services', 'Get a Quote', 'Contact Us', 'About SMT']
const API_BASE = '/api'

function getTime() {
  const d = new Date()
  return `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`
}

function formatText(text) {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/•/g, '&bull;')
    .replace(/\n/g, '<br />')
}

export default function Chatbot() {
  const [open,      setOpen]      = useState(false)
  const [messages,  setMessages]  = useState([])
  const [input,     setInput]     = useState('')
  const [typing,    setTyping]    = useState(false)
  const [showQuick, setShowQuick] = useState(true)
  const [badge,     setBadge]     = useState(true)
  const endRef = useRef()

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, typing])

  const openChat = () => {
    setOpen(true)
    setBadge(false)
    if (messages.length === 0) {
      setTimeout(() => addBot(
        "👋 Hello! Welcome to **Soft Master Technology**!\n\nI'm your virtual assistant. Ask me anything about our services, pricing, or team. How can I help you today?"
      ), 400)
    }
  }

  const addBot  = text => setMessages(prev => [...prev, { who: 'bot',  text, time: getTime() }])
  const addUser = text => setMessages(prev => [...prev, { who: 'user', text, time: getTime() }])

  const send = async (text) => {
    const msg = (text || input).trim()
    if (!msg) return
    setInput('')
    setShowQuick(false)
    addUser(msg)
    setTyping(true)
    try {
      const res = await fetch(`${API_BASE}/chat`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ message: msg, session_id: 'web-' + Date.now() }),
      })
      const data = await res.json()
      setTyping(false)
      addBot(data.reply || "I'm not sure how to answer that. Please contact us directly!")
    } catch {
      setTyping(false)
      addBot('Sorry, something went wrong. Please call us at **+91 98765 43210** 📞')
    }
  }

  return (
    <>
      {/* Floating button */}
      <button className="cb-btn" onClick={open ? () => setOpen(false) : openChat} aria-label="Chat with us">
        {badge && <span className="cb-badge">1</span>}
        {open
          ? <svg viewBox="0 0 24 24" fill="white"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
          : <svg viewBox="0 0 24 24" fill="white"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z"/></svg>
        }
      </button>

      {/* Chat window */}
      <div className={`cb-window ${open ? 'open' : ''}`}>

        {/* Header */}
        <div className="cb-head">
          <div className="cb-avatar">🤖</div>
          <div className="cb-head-info">
            <strong>SMT Assistant</strong>
            <span><span className="cb-online" /> Online · Replies instantly</span>
          </div>
          <button className="cb-close" onClick={() => setOpen(false)}>✕</button>
        </div>

        {/* Messages */}
        <div className="cb-msgs">
          {messages.map((m, i) => (
            <div key={i} className={`cb-msg ${m.who}`}>
              <div className="cb-av">{m.who === 'bot' ? '🤖' : '👤'}</div>
              <div>
                <div className="cb-bubble" dangerouslySetInnerHTML={{ __html: formatText(m.text) }} />
                <div className="cb-time">{m.time}</div>
              </div>
            </div>
          ))}

          {typing && (
            <div className="cb-msg bot">
              <div className="cb-av">🤖</div>
              <div className="cb-bubble typing"><span /><span /><span /></div>
            </div>
          )}
          <div ref={endRef} />
        </div>

        {/* Quick replies */}
        {showQuick && messages.length > 0 && (
          <div className="cb-quick">
            {QUICK.map(q => (
              <button key={q} className="cb-qb" onClick={() => send(q)}>{q}</button>
            ))}
          </div>
        )}

        {/* Input */}
        <div className="cb-input-wrap">
          <input
            className="cb-input"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && send()}
            placeholder="Type your message..."
          />
          <button className="cb-send" onClick={() => send()} aria-label="Send">
            <svg viewBox="0 0 24 24" fill="white"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
          </button>
        </div>

      </div>
    </>
  )
}
