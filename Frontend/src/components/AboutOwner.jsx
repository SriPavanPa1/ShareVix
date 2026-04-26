import React from 'react';
import { User, TrendingUp, BookOpen, Target } from 'lucide-react';
import devanandImg from '../assets/devanand.jpg';

const AboutOwner = () => {
    return (
        <section className="about-owner section-padding" style={{ backgroundColor: '#ffffff' }}>
            <div className="container">
                <h2 className="section-title">Meet the <span>Founder</span></h2>
                
                <div style={{ 
                    display: 'flex', 
                    flexDirection: 'column',
                    alignItems: 'center',
                    maxWidth: '900px',
                    margin: '1rem auto 0',
                    padding: '3rem 2rem',
                    backgroundColor: '#fff',
                    borderRadius: '16px',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.05)',
                    border: '1px solid #f0f0f0'
                }}>
                    <div style={{
                        width: '120px',
                        height: '120px',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: '1.5rem',
                        boxShadow: '0 8px 20px rgba(0,123,255,0.15)',
                        overflow: 'hidden'
                    }}>
                        <img 
                            src={devanandImg} 
                            alt="Devanand Gautre" 
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                        />
                    </div>
                    
                    <h3 style={{ fontSize: '2rem', color: '#1a1a1a', marginBottom: '0.5rem', fontWeight: 'bold' }}>Devanand Gautre</h3>
                    <p style={{ fontSize: '1.2rem', color: '#007bff', fontWeight: '600', marginBottom: '2rem' }}>
                        Full-Time Options Trader & Founder of ShareVix
                    </p>
                    
                    <div style={{ 
                        color: '#555', 
                        lineHeight: '1.8', 
                        fontSize: '1.1rem',
                        textAlign: 'center',
                        marginBottom: '2.5rem'
                    }}>
                        <p style={{ marginBottom: '1rem' }}>
                            Devanand Gautre holds an M.Tech in Mechanical Engineering and has over 10 years of experience mentoring IES and GATE aspirants.
                        </p>
                        <p style={{ marginBottom: '1rem' }}>
                            He specializes in options trading using quantitative models like Black-Scholes and Put-Call Parity to identify pricing inefficiencies and arbitrage opportunities in the stock market.
                        </p>
                        <p>
                            Through ShareVix, Devanand aims to simplify complex option strategies and help traders build a disciplined, data-driven approach to consistent trading success.
                        </p>
                    </div>

                    {/* Highlights */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                        gap: '2rem',
                        width: '100%',
                        marginTop: '1rem',
                        borderTop: '1px solid #eee',
                        paddingTop: '3rem'
                    }}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                            <div style={{ background: '#f8f9fa', padding: '1rem', borderRadius: '50%', marginBottom: '1rem' }}>
                                <BookOpen size={28} color="#007bff" />
                            </div>
                            <h4 style={{ fontSize: '1.1rem', marginBottom: '0.5rem', color: '#333' }}>Experienced Educator</h4>
                            <p style={{ fontSize: '0.95rem', color: '#666' }}>10+ years mentoring IES & GATE aspirants</p>
                        </div>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                            <div style={{ background: '#f8f9fa', padding: '1rem', borderRadius: '50%', marginBottom: '1rem' }}>
                                <TrendingUp size={28} color="#007bff" />
                            </div>
                            <h4 style={{ fontSize: '1.1rem', marginBottom: '0.5rem', color: '#333' }}>Options Specialist</h4>
                            <p style={{ fontSize: '0.95rem', color: '#666' }}>Quantitative models & arbitrage opportunities</p>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                            <div style={{ background: '#f8f9fa', padding: '1rem', borderRadius: '50%', marginBottom: '1rem' }}>
                                <Target size={28} color="#007bff" />
                            </div>
                            <h4 style={{ fontSize: '1.1rem', marginBottom: '0.5rem', color: '#333' }}>Quant Trader</h4>
                            <p style={{ fontSize: '0.95rem', color: '#666' }}>Disciplined approach to trading success</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default AboutOwner;
