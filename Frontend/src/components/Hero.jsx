import React from 'react'
import heroImg from '../assets/hero.png'
import devanand from '../assets/devanand.jpg'

const Hero = () => {
    return (
        <section className="hero grid-bg">
            <div className="container hero-content">
                <div className="hero-text">
                    <h1>
                        Beyond Basics : <span style={{ color: 'var(--accent-green)' }}>Pure</span> <span style={{ color: 'var(--primary)' }}>Technical Mastery.</span>
                    </h1>
                    <p>Master the market with Hyderabad's expert traders. From basics to advanced institutional strategies.</p>
                    <div style={{ display: 'flex', gap: '16px', marginTop: '32px' }}>
                        <button className="btn-primary">View Courses </button>
                        {/* <button className="btn-black" style={{ border: '2px solid var(--border)' }}>Join The Membership</button> */}
                    </div>
                </div>
                <div className="hero-image">
                    <div className="image-wrapper">
                        <img src={devanand} alt="Expert Trader" />
                    </div>
                </div>
            </div>
        </section>
    )
}

export default Hero
