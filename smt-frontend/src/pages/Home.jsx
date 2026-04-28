import React from 'react'
import Loader    from '../components/Loader'
import Navbar    from '../components/Navbar'
import Hero      from '../components/Hero'
import Marquee   from '../components/Marquee'
import Services  from '../components/Services'
import Stats     from '../components/Stats'
import About     from '../components/About'
import Tech      from '../components/Tech'
import Portfolio from '../components/Portfolio'
import Contact   from '../components/Contact'
import Footer    from '../components/Footer'
import Chatbot   from '../components/Chatbot'

export default function Home() {
  return (
    <>
      <Loader />
      <Navbar />
      <main>
        <Hero />
        <Marquee />
        <Services />
        <Stats />
        <About />
        <Tech />
        <Portfolio />
        <Contact />
      </main>
      <Footer />
      <Chatbot />
    </>
  )
}
