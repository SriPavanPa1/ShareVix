import React, { useState } from 'react'

const Pricing = () => {
    const [isAnnual, setIsAnnual] = useState(false)

    const plans = [
        {
            name: 'Free',
            price: '0',
            features: ['Monthly 1 Zoom Session', 'Exclusive Community Access', 'Other Exclusive Perks'],
            cta: 'Get Started'
        },
        {
            name: 'Basic +',
            price: isAnnual ? '695' : '795',
            features: ['Daily Levels', 'Discord Live', '50+ Learning Videos', 'Monthly 2 Zoom Session', 'Hyderabad Traders\'s Combo'],
            cta: 'Get Started'
        },
        {
            name: 'Premium',
            price: isAnnual ? '2125' : '2525',
            features: ['Basic + (All Incl)', 'Bull & Arrow Indicators', 'Deliver', 'White Panther Strategy', 'Pink Panther Strategy'],
            cta: 'Get Started',
            popular: true
        }
    ]

    return (
        <section id="pricing" className="pricing section-padding">
            <div className="container">
                <h2 className="section-title">Ready to <span>get started</span></h2>

                <div className="pricing-toggle">
                    <span className={!isAnnual ? 'active' : ''}>Monthly</span>
                    <div className="toggle-switch" onClick={() => setIsAnnual(!isAnnual)}>
                        <div className={`switch-ball ${isAnnual ? 'right' : ''}`}></div>
                    </div>
                    <span className={isAnnual ? 'active' : ''}>Annually</span>
                </div>

                {isAnnual && <div className="discount-badge">Annually you have save 15% off, and free indicators 🎁</div>}

                <div className="pricing-grid">
                    {plans.map((plan, index) => (
                        <div className={`pricing-card ${plan.popular ? 'popular' : ''}`} key={index}>
                            {plan.popular && <div className="popular-tag">MOST POPULAR</div>}
                            <h3>{plan.name}</h3>
                            <div className="price">
                                <span className="currency">₹</span>
                                <span className="amount">{plan.price}</span>
                                <span className="period">/ per month</span>
                            </div>
                            <ul className="plan-features">
                                {plan.features.map((f, i) => (
                                    <li key={i}>{f}</li>
                                ))}
                            </ul>
                            <button className={`btn-plan ${plan.popular ? 'btn-primary' : ''}`}>
                                {plan.cta}
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}

export default Pricing
