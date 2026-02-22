import React from 'react'
import { Disc, Video, PlayCircle, BarChart2, Activity, HelpCircle } from 'lucide-react'

const Features = () => {
    const features = [
        { title: 'Discord Access', desc: 'Exclusive trading Discord: real-time insights, strategies, and connections.', icon: <Disc size={24} />, color: 'var(--primary)' },
        { title: 'Live Classes', desc: 'Attend live sessions for mastering trading with interactive learning and Q&A.', icon: <Activity size={24} />, color: 'var(--accent-green)' },
        { title: 'Recording Videos', desc: 'Watch videos to master trading techniques at your pace, anywhere.', icon: <PlayCircle size={24} />, color: 'var(--accent-red)' },
        { title: 'Live Market Trading', desc: 'Learn real-time strategies, trade with pros, and get immediate feedback.', icon: <Video size={24} />, color: 'var(--primary)' },
        { title: 'Free Indicators', desc: 'Free tools enhance market analysis, boosting trading precision.', icon: <BarChart2 size={24} />, color: 'var(--accent-green)' },
        { title: 'Live Market Assistance', desc: 'Instant expert support for confident trading in real-time scenarios.', icon: <HelpCircle size={24} />, color: 'var(--accent-red)' }
    ]

    return (
        <section className="features section-padding">
            <div className="container">
                <h2 className="section-title">Key <span>Features</span> of the Membership</h2>
                <div className="features-grid">
                    {features.map((f, i) => (
                        <div className="feature-card" key={i}>
                            <div className="feature-icon" style={{ backgroundColor: `${f.color}15`, color: f.color }}>{f.icon}</div>
                            <div className="feature-text">
                                <h3>{f.title}</h3>
                                <p>{f.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}

export default Features
