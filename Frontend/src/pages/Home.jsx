import React from 'react'
import Hero from '../components/Hero'
import Learning from '../components/Learning'
import Features from '../components/Features'
import Pricing from '../components/Pricing'
import EventBanner from '../components/EventBanner'
import Testimonials from '../components/Testimonials'
import FAQ from '../components/FAQ'

function Home() {
  return (
    <div className="home">
      <Hero />
      <Learning />
      <Features />
      <Pricing />
      <EventBanner />
      <Testimonials />
      <FAQ />
    </div>
  )
}

export default Home
