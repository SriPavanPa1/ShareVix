import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { blogAPI } from '../services/api';
import iconsPack from '../assets/icons.png';
import { Calendar, User, ChevronRight, ArrowRight } from "lucide-react";
import "../styles/Blog.css";

const TradingTips = () => {
    const [tips, setTips] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedTip, setSelectedTip] = useState(null);
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

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric"
        });
    };

    const getAuthorName = (post) => {
        return post.author_name || post.users?.name || "Unknown";
    };

    if (loading || tips.length === 0) {
        return null;
    }

    if (selectedTip) {
        return (
            <section className="learning section-padding" style={{ backgroundColor: '#f8f9fa' }}>
                <div className="blog-page" style={{ padding: 0 }}>
                    <section className="single-post-hero" style={{ padding: '20px 0', minHeight: 'auto' }}>
                        <div className="container">
                            <button 
                                className="back-btn"
                                onClick={() => setSelectedTip(null)}
                            >
                                <ChevronRight size={20} /> Back to Trading Tips
                            </button>
                        </div>
                    </section>

                    <section className="single-post-section" style={{ paddingTop: '20px' }}>
                        <div className="container">
                            <article className="single-post">
                                <div className="post-header">
                                    <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>{selectedTip.title}</h1>
                                    <div className="post-meta-single">
                                        <span className="meta-badge">
                                            <Calendar size={16} />
                                            {formatDate(selectedTip.created_at)}
                                        </span>
                                        <span className="meta-badge">
                                            <User size={16} />
                                            {getAuthorName(selectedTip)}
                                        </span>
                                    </div>
                                </div>

                                {selectedTip.featured_image_url && (
                                    <div className="featured-image-wrapper">
                                        <img 
                                            src={selectedTip.featured_image_url} 
                                            alt={selectedTip.title}
                                            className="featured-image"
                                        />
                                    </div>
                                )}

                                <div className="post-content" dangerouslySetInnerHTML={{ __html: selectedTip.content }} />

                                <div className="post-footer">
                                    <button 
                                        className="back-btn-bottom"
                                        onClick={() => setSelectedTip(null)}
                                    >
                                        <ChevronRight size={20} /> Back to Trading Tips
                                    </button>
                                </div>
                            </article>
                        </div>
                    </section>
                </div>
            </section>
        );
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
                            onClick={() => setSelectedTip(post)}
                            style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column' }}
                        >
                            <div className="card-icon" style={{ overflow: 'hidden', height: '180px', width: '100%', borderRadius: '12px', marginBottom: '1.5rem', background: '#f0f0f0' }}>
                                <img 
                                    src={post.featured_image_url || iconsPack} 
                                    alt={post.title} 
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                />
                            </div>
                            <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>{post.title}</h3>
                            <p style={{ marginBottom: '1.5rem', flexGrow: 1 }}>{post.description ? stripHtml(post.description) : stripHtml(post.content)}</p>
                            
                            <button 
                                className="read-more-btn"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedTip(post);
                                }}
                                style={{ marginTop: 'auto', alignSelf: 'flex-start' }}
                            >
                                Read Article
                                <ArrowRight size={16} />
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default TradingTips;
