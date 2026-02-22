import React from 'react'
import iconsPack from '../assets/icons.png'

const Learning = () => {
    const topics = [
        { title: 'Basics of Stock Market', desc: 'Master stock market basic terms and key principles for a solid foundation.' },
        { title: 'Technicals of Option', desc: 'Explore basics, Greeks, volatility, and strategies for successful trading.' },
        { title: 'Option Trading', desc: 'Master option basics and key strategies for confident trading.' },
        { title: 'Strategy for Profit Trading', desc: 'Optimize trades, develop a robust strategy for profitable trading success.' }
    ]

    return (
        <section className="learning section-padding">
            <div className="container">
                <h2 className="section-title">What you will Learn on the <span>Membership</span></h2>

                <div className="learning-grid">
                    {topics.map((topic, index) => (
                        <div className="learning-card" key={index}>
                            <div className="card-icon">
                                <img src={iconsPack} alt={topic.title} />
                            </div>
                            <h3>{topic.title}</h3>
                            <p>{topic.desc}</p>
                        </div>
                    ))}
                </div>

                <div className="trust-bubble">
                    <div className="avatar-pile">
                        <span>+5000 students trust Hyderabad Traders Trading</span>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default Learning
