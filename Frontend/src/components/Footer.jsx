import React from 'react'
import { Link } from 'react-router-dom'

const Footer = () => {
    return (
        <footer className="footer">
            <div className="container">
                <div className="footer-content">
                    <div className="footer-brand">
                        <h2>HYDERABAD TRADER</h2>
                        <p>Empowering traders with knowledge and strategies.</p>
                    </div>
                    <div className="footer-links">
                        <div className="link-group">
                            <h4>Quick Links</h4>
                            <ul>
                                <li><Link to="/">Home</Link></li>
                                <li><Link to="/courses">Courses</Link></li>
                                <li><Link to="/blog">Blog</Link></li>
                                {/* <li><Link to="/membership">Join The Membership</Link></li> */}
                                <li><Link to="/contact">Contact Us</Link></li>
                            </ul>
                        </div>
                        <div className="link-group">
                            <h4>Legal</h4>
                            <ul>
                                <li><a href="#">Privacy Policy</a></li>
                                <li><a href="#">Terms of Service</a></li>
                            </ul>
                        </div>
                    </div>
                </div>
                <div className="footer-bottom">
                    <p>© 2026 Hyderabad Trader. All rights reserved.</p>
                </div>
            </div>
        </footer>
    )
}

export default Footer
