import React from 'react';
import { Mail, Instagram, Facebook, Twitter } from 'lucide-react';

const ContactUs = () => {
    return (
        <section className="contact-us section-padding" style={{ backgroundColor: '#f4f7f6', padding: '5rem 0' }}>
            <style>
                {`
                    .social-btn {
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        width: 60px;
                        height: 60px;
                        border-radius: 16px;
                        background: #f8f9fa;
                        color: #444;
                        text-decoration: none;
                        transition: all 0.3s ease;
                        border: 1px solid #ebebeb;
                    }
                    .social-btn.instagram:hover {
                        background: #e1306c;
                        color: #fff;
                        border-color: #e1306c;
                        transform: translateY(-3px);
                        box-shadow: 0 8px 15px rgba(225, 48, 108, 0.3);
                    }
                    .social-btn.facebook:hover {
                        background: #1877f2;
                        color: #fff;
                        border-color: #1877f2;
                        transform: translateY(-3px);
                        box-shadow: 0 8px 15px rgba(24, 119, 242, 0.3);
                    }
                    .social-btn.twitter:hover {
                        background: #1da1f2;
                        color: #fff;
                        border-color: #1da1f2;
                        transform: translateY(-3px);
                        box-shadow: 0 8px 15px rgba(29, 161, 242, 0.3);
                    }
                `}
            </style>
            <div className="container">
                <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
                    <h2 className="section-titles" style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#2b2b2b' }}>
                        Contact <span>Us</span>
                    </h2>
                    <p style={{ color: '#666', fontSize: '1.1rem', maxWidth: '600px', margin: '1rem auto 0' }}>
                        Have questions about our courses or need support? We're here to help you on your trading journey.
                    </p>
                </div>

                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '3rem',
                    maxWidth: '800px',
                    margin: '0 auto',
                    background: '#fff',
                    padding: '4rem 2rem',
                    borderRadius: '24px',
                    boxShadow: '0 15px 40px rgba(0,0,0,0.06)'
                }}>

                    {/* Email Focus */}
                    <div style={{ textAlign: 'center' }}>
                        <div style={{
                            width: '80px',
                            height: '80px',
                            background: 'linear-gradient(135deg, #007bff, #0056b3)',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 1.5rem',
                            color: '#fff',
                            boxShadow: '0 8px 20px rgba(0,123,255,0.3)'
                        }}>
                            <Mail size={36} />
                        </div>
                        <h3 style={{ fontSize: '1.5rem', color: '#333', marginBottom: '0.5rem' }}>Drop us a line</h3>
                        <a
                            href="mailto:support@sharevix.com"
                            style={{
                                fontSize: '1.5rem',
                                fontWeight: 'bold',
                                color: '#007bff',
                                textDecoration: 'none'
                            }}
                        >
                            support@sharevix.com
                        </a>
                        <p style={{ color: '#777', marginTop: '1rem', fontSize: '1.05rem' }}>We try to reply to all inquiries within 24 hours.</p>
                    </div>

                    {/* Socials Divider */}
                    <div style={{ width: '100%', height: '1px', background: '#e0e0e0', position: 'relative' }}>
                        <span style={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            background: '#fff',
                            padding: '0 15px',
                            color: '#aaa',
                            fontWeight: '600',
                            textTransform: 'uppercase',
                            fontSize: '0.85rem'
                        }}>Follow Us</span>
                    </div>

                    {/* Social Links Focus */}
                    <div style={{
                        display: 'flex',
                        gap: '1.5rem',
                        justifyContent: 'center'
                    }}>
                        <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="social-btn instagram">
                            <Instagram size={28} />
                        </a>
                        <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="social-btn facebook">
                            <Facebook size={28} />
                        </a>
                        <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="social-btn twitter">
                            <Twitter size={28} />
                        </a>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default ContactUs;
