import React from 'react'

const Testimonials = () => {
    const reviews = [
        { name: 'Naveen Chauhan', text: 'I am very happy with the Seminar and Hyderabad Traders\'s teaching and look forward to continue learning more. Five stars well deserved.' },
        { name: 'Arjun Agarwal', text: 'Hyderabad Traders\'s teaching style is a perfect blend of clarity and depth, making complex trading concepts accessible even to beginners.' },
        { name: 'Ravindra Kothalkar', text: 'It\'s a life changing experience for me post Pune seminar.' }
    ]

    return (
        <section className="testimonials section-padding">
            <div className="container">
                <h2 className="section-title">What people <span>think about us</span></h2>
                <div className="testimonial-grid">
                    {reviews.map((r, i) => (
                        <div className="testimonial-card" key={i}>
                            <p className="review-text">"{r.text}"</p>
                            <div className="reviewer">
                                <div className="reviewer-avatar">{r.name[0]}</div>
                                <span className="reviewer-name">{r.name}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}

export default Testimonials
