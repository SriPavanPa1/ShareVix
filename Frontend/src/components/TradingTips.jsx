import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { blogAPI } from '../services/api';
import iconsPack from '../assets/icons.png';

const TradingTips = () => {
    const [tips, setTips] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchTips = async () => {
            try {
                const response = await blogAPI.getAll({ page: 1, limit: 100 });
                const allBlogs = response.data.blogs || [];
                // Filter for Trading Tips category
                const tradingTips = allBlogs.filter(post => 
                    post.category === 'Trading Tips' && 
                    (!post.tags || 
                     post.tags.length === 0 || 
                     (Array.isArray(post.tags) && post.tags.some(t => t.toLowerCase() === 'blogs')) ||
                     (typeof post.tags === 'string' && post.tags.toLowerCase() === 'blogs'))
                );
                // Get the latest 4 tips
                setTips(tradingTips.slice(0, 4));
            } catch (error) {
                console.error("Error fetching trading tips:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchTips();
    }, []);

    const stripHtml = (html) => {
        if (!html) return "";
        const tmp = document.createElement("DIV");
        tmp.innerHTML = html;
        const text = tmp.textContent || tmp.innerText || "";
        return text.length > 100 ? text.substring(0, 100) + "..." : text;
    };

    if (loading || tips.length === 0) {
        return null;
    }

    return (
        <section className="learning section-padding" style={{ backgroundColor: '#f8f9fa' }}>
            <div className="container">
                <h2 className="section-title">Trading <span>Tips</span></h2>

                <div className="learning-grid">
                    {tips.map((post) => (
                        <div 
                            className="learning-card" 
                            key={post.id} 
                            onClick={() => navigate('/blog')}
                            style={{ cursor: 'pointer' }}
                        >
                            <div className="card-icon" style={{ overflow: 'hidden' }}>
                                <img 
                                    src={post.featured_image_url || iconsPack} 
                                    alt={post.title} 
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                />
                            </div>
                            <h3>{post.title}</h3>
                            <p>{post.description ? stripHtml(post.description) : stripHtml(post.content)}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default TradingTips;
