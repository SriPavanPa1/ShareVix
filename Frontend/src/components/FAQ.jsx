import React, { useState } from 'react'

const FAQ = () => {
    const [active, setActive] = useState(0)

    const faqs = [
        { q: 'What is Hyderabad Trader\'s Trading?', a: 'Hyderabad Trader\'s Trading is a premium education platform for stock market and options traders.' },
        { q: 'Hyderabad Traders\'s trading programs are suitable for whom?', a: 'They are suitable for everyone from complete beginners to advanced traders.' },
        { q: 'What can I expect in the trading room?', a: 'Expect real-time analysis, live trades, and continuous learning support.' }
    ]

    return (
        <section className="faq section-padding">
            <div className="container">
                <h2 className="section-title">Checkout recent <span>FAQs</span></h2>
                <div className="faq-list">
                    {faqs.map((f, i) => (
                        <div className={`faq-item ${active === i ? 'active' : ''}`} key={i} onClick={() => setActive(i)}>
                            <div className="faq-question">
                                <h3>{f.q}</h3>
                                <span>{active === i ? '-' : '+'}</span>
                            </div>
                            <div className="faq-answer">
                                <p>{f.a}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}

export default FAQ
