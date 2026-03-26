import React from 'react'
import Hero from '../components/Hero'
import Learning from '../components/Learning'
import TradingTips from '../components/TradingTips'
import Features from '../components/Features'
import Pricing from '../components/Pricing'
import EventBanner from '../components/EventBanner'
import Testimonials from '../components/Testimonials'
import FAQ from '../components/FAQ'
import AboutOwner from '../components/AboutOwner'

function Home() {
  return (
    <div className="home">
      <Hero />
      <Learning />
      <TradingTips />
      {/* <Features /> */}
      {/* <Pricing /> */}
      {/* <EventBanner /> */}
      {/* <Testimonials /> */}
      <AboutOwner />
      {/* <FAQ /> */}
    </div>
  )
}

export default Home
