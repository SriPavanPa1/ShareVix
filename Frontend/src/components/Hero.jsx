import React from 'react'
import devanand from '../assets/devanand.jpg'
import sharevixBg from '../assets/sharevix.jpeg'

const Hero = () => {
    return (
        <section
            className="hero"
            style={{
                backgroundImage: `linear-gradient(rgba(10, 20, 40, 0.72), rgba(10, 20, 40, 0.72)), url(${sharevixBg})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
            }}
        >
            <div className="container hero-content">
                <div className="hero-text">
                    <h1>
                        Let's Simplify <br />
                        {/* <span style={{ color: 'var(--accent-green)' }}>Pure</span> */}
                        <span style={{ color: 'var(--primary)' }}>The Stock Market.</span>
                    </h1>
                    <p>Master the market with Hyderabad's expert trader. From basics to advanced institutional strategies.</p>
                    {/* <div style={{ display: 'flex', gap: '16px', marginTop: '32px' }}>
                        <button className="btn-primary">View Courses </button>
                        <button className="btn-black" style={{ border: '2px solid var(--border)' }}>Join The Membership</button>
                    </div> */}
                </div>
                {/* <div className="hero-image">
                    <div className="image-wrapper">
                        <img src={devanand} alt="Expert Trader" />
                    </div>
                </div> */}
            </div>
        </section>
    )
}

export default Hero
