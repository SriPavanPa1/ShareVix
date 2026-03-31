import React, { useState } from 'react';
import emailjs from '@emailjs/browser';

/* ─── Social platform data ──────────────────────────────────────────── */
const SOCIALS = [
    {
        key: 'email',
        label: 'Email',
        handle: 'support@sharevix.com',
        href: 'mailto:support@sharevix.com',
        color: '#6366f1',
        icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                strokeLinecap="round" strokeLinejoin="round" width="22" height="22">
                <rect x="2" y="4" width="20" height="16" rx="2" />
                <path d="M2 7l10 7 10-7" />
            </svg>
        ),
    },
    {
        key: 'instagram',
        label: 'Instagram',
        handle: 'insta@sharevix',
        href: 'https://www.instagram.com/sharevix?utm_source=qr&igsh=a2Y4bWh5aWlqODZk',
        color: '#e1306c',
        gradient: 'linear-gradient(45deg,#f09433,#e6683c,#dc2743,#cc2366,#bc1888)',
        icon: (
            <svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 1.366.062 2.633.332 3.608 1.308.975.975 1.246 2.242 1.308 3.608.058 1.266.07 1.646.07 4.85s-.012 3.584-.07 4.85c-.062 1.366-.333 2.633-1.308 3.608-.975.975-2.242 1.246-3.608 1.308-1.266.058-1.646.07-4.85.07s-3.584-.012-4.85-.07c-1.366-.062-2.633-.332-3.608-1.308C2.495 19.483 2.224 18.216 2.162 16.85 2.104 15.584 2.092 15.204 2.092 12s.012-3.584.07-4.85C2.224 5.784 2.495 4.517 3.47 3.542c.975-.975 2.242-1.246 3.608-1.308C8.416 2.175 8.796 2.163 12 2.163zm0-2.163C8.741 0 8.333.013 7.053.072 5.775.131 4.602.425 3.635 1.392 2.668 2.36 2.374 3.532 2.315 4.81 2.256 6.09 2.243 6.498 2.243 12c0 5.502.013 5.91.072 7.19.059 1.278.353 2.45 1.32 3.418.967.967 2.14 1.261 3.418 1.32C8.333 23.987 8.741 24 12 24s3.667-.013 4.947-.072c1.278-.059 2.45-.353 3.418-1.32.967-.968 1.261-2.14 1.32-3.418.059-1.28.072-1.688.072-7.19 0-5.502-.013-5.91-.072-7.19-.059-1.278-.353-2.45-1.32-3.418C19.397.425 18.225.131 16.947.072 15.667.013 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zm0 10.162a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
            </svg>
        ),
    },
    {
        key: 'twitter',
        label: 'Twitter / X',
        handle: 'x@sharevix',
        href: 'https://x.com/Sharevix',
        color: '#1da1f2',
        icon: (
            <svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
        ),
    },
    {
        key: 'facebook',
        label: 'Facebook',
        handle: 'facebook@sharevix',
        href: 'https://www.facebook.com/share/1E27FgWKjK/',
        color: '#1877f2',
        icon: (
            <svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22">
                <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.41c0-3.025 1.792-4.697 4.533-4.697 1.312 0 2.686.236 2.686.236v2.97h-1.513c-1.491 0-1.956.93-1.956 1.874v2.25h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z" />
            </svg>
        ),
    },
    {
        key: 'threads',
        label: 'Threads',
        handle: 'threads@sharevix',
        href: 'https://www.threads.com/@sharevix',
        color: '#101010',
        icon: (
            <svg viewBox="0 0 192 192" fill="currentColor" width="22" height="22">
                <path d="M141.537 88.988a66.667 66.667 0 00-2.518-1.143c-1.482-27.307-16.403-42.94-41.457-43.1h-.34c-14.986 0-27.449 6.396-35.12 18.036l13.779 9.452c5.73-8.695 14.724-10.548 21.348-10.548h.229c8.249.053 14.474 2.452 18.503 7.129 2.932 3.405 4.893 8.111 5.864 14.05-7.314-1.243-15.224-1.626-23.68-1.14-23.82 1.373-39.134 15.265-38.105 34.569.522 9.792 5.4 18.216 13.735 23.719 7.047 4.652 16.124 6.927 25.557 6.412 12.458-.683 22.231-5.436 29.049-14.127 5.178-6.6 8.453-15.153 9.899-25.93 5.937 3.583 10.337 8.298 12.767 13.966 4.132 9.635 4.373 25.468-8.546 38.376-11.319 11.308-24.925 16.2-45.488 16.351-22.809-.169-40.06-7.484-51.275-21.742C35.236 139.966 29.808 120.682 29.605 96c.203-24.682 5.63-43.966 16.133-57.317C56.954 24.425 74.206 17.11 97.015 16.94c22.975.17 40.526 7.52 52.171 21.847 5.71 7.026 10.015 15.86 12.853 26.162l16.147-4.308c-3.44-12.68-8.853-23.606-16.219-32.668C147.036 9.607 125.202.195 97.35 0h-.38C69.285.195 47.787 9.65 33.244 28.127 20.17 44.837 13.397 68.412 13.185 96c.212 27.588 6.985 51.163 20.059 67.877C47.787 182.354 69.285 191.81 96.97 192h.38c24.888-.184 42.345-6.71 56.986-21.34 19.088-19.073 18.474-43.089 12.184-57.816-4.556-10.623-13.228-19.279-24.983-24.856zM98.44 129.507c-10.44.588-21.286-4.098-21.82-14.135-.397-7.442 5.296-15.746 22.461-16.735 1.966-.114 3.895-.169 5.79-.169 6.235 0 12.068.606 17.371 1.765-1.978 24.702-13.58 28.713-23.802 29.274z" />
            </svg>
        ),
    },
];

const ContactUs = () => {
    const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' });
    const [status, setStatus] = useState('idle'); // idle | sending | success | error
    const [errorMsg, setErrorMsg] = useState('');

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus('sending');
        setErrorMsg('');

        const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
        const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
        const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

        const templateParams = {
            from_name: form.name,
            from_email: form.email,
            phone: form.phone || 'Not provided',
            message: form.message,
            to_email: 'support@sharevix.com',
        };

        try {
            await emailjs.send(serviceId, templateId, templateParams, publicKey);
            setStatus('success');
            setForm({ name: '', email: '', phone: '', message: '' });
            setTimeout(() => setStatus('idle'), 5000);
        } catch (err) {
            console.error('EmailJS error:', err);
            setErrorMsg('Failed to send. Please try again or email us directly.');
            setStatus('error');
        }
    };

    return (
        <section style={{ background: 'linear-gradient(135deg,#4f46e5 0%,#7c3aed 100%)', padding: '5rem 0' }}>
            <style>{`
        .cu-wrapper {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0;
          max-width: 1000px;
          margin: 0 auto;
          border-radius: 24px;
          overflow: hidden;
          box-shadow: 0 24px 60px rgba(0,0,0,0.25);
        }
        @media (max-width: 768px) {
          .cu-wrapper { grid-template-columns: 1fr; }
        }

        /* ── Left: ticket form ── */
        .cu-left {
          background: linear-gradient(160deg,#5b52f0 0%,#7e5bef 100%);
          padding: 2.5rem 2rem;
          color: #fff;
        }
        .cu-left h2 { font-size: 1.65rem; font-weight: 800; margin-bottom: 0.4rem; color:#fff; }
        .cu-left p  { font-size: 0.88rem; opacity: 0.85; margin-bottom: 1.8rem; }

        .cu-field { margin-bottom: 1.2rem; }
        .cu-field label { display: block; font-size: 0.78rem; font-weight: 600; margin-bottom: 0.4rem; opacity:.9; }
        .cu-field input,
        .cu-field textarea {
          width: 100%;
          padding: 0.7rem 1rem;
          border-radius: 10px;
          border: 1px solid rgba(255,255,255,0.25);
          background: rgba(255,255,255,0.15);
          color: #fff;
          font-size: 0.88rem;
          font-family: inherit;
          outline: none;
          transition: border-color .2s, background .2s;
        }
        .cu-field input::placeholder,
        .cu-field textarea::placeholder { color: rgba(255,255,255,0.55); }
        .cu-field input:focus,
        .cu-field textarea:focus {
          border-color: rgba(255,255,255,0.7);
          background: rgba(255,255,255,0.22);
        }
        .cu-field textarea { resize: vertical; min-height: 110px; }

        .cu-submit {
          width: 100%;
          padding: 0.85rem;
          border-radius: 10px;
          background: #fff;
          color: #5b52f0;
          font-weight: 700;
          font-size: 0.9rem;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          border: none;
          cursor: pointer;
          margin-top: 0.5rem;
          transition: transform .2s, box-shadow .2s;
        }
        .cu-submit:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(0,0,0,0.2); }

        .cu-success {
          margin-top: 0.8rem;
          padding: 0.7rem 1rem;
          background: rgba(255,255,255,0.18);
          border-radius: 8px;
          font-size: 0.85rem;
          text-align: center;
          border: 1px solid rgba(255,255,255,0.35);
        }

        .cu-error {
          margin-top: 0.8rem;
          padding: 0.7rem 1rem;
          background: rgba(239,68,68,0.25);
          border-radius: 8px;
          font-size: 0.85rem;
          text-align: center;
          border: 1px solid rgba(239,68,68,0.5);
          color: #fff;
        }

        /* ── Right: contact info ── */
        .cu-right {
          background: #fff;
          padding: 2.5rem 2rem;
        }
        .cu-right h2 { font-size: 1.65rem; font-weight: 800; color:#1e1b4b; margin-bottom: 0.3rem; }
        .cu-right > p { font-size: 0.88rem; color: #6b7280; margin-bottom: 1.8rem; }

        /* Social rows */
        .cu-social-row {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 0.85rem 1rem;
          border-radius: 12px;
          background: #f5f6ff;
          margin-bottom: 0.9rem;
          text-decoration: none;
          color: inherit;
          transition: background .2s;
        }
        .cu-social-row:last-of-type { margin-bottom: 0; }
        .cu-social-row:hover { background: #ede9fe; }

        .cu-icon-wrap {
          width: 44px; height: 44px;
          border-radius: 12px;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
          color: #fff;
        }
        .cu-social-info { display: flex; flex-direction: column; gap: 1px; }
        .cu-social-label {
          font-size: 0.72rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: #5b52f0;
        }
        .cu-social-handle { font-size: 0.9rem; color: #374151; font-weight: 500; }
      `}</style>

            <div className="cu-wrapper">

                {/* ── LEFT: Support Ticket ── */}
                <div className="cu-left">
                    <h2>Create a Support Ticket</h2>
                    <p>Fill out the form below and we'll get back to you as soon as possible.</p>

                    <form onSubmit={handleSubmit}>
                        <div className="cu-field">
                            <label>Name</label>
                            <input
                                type="text" name="name" required
                                placeholder="Enter your full name"
                                value={form.name} onChange={handleChange}
                            />
                        </div>
                        <div className="cu-field">
                            <label>Email</label>
                            <input
                                type="email" name="email" required
                                placeholder="your.email@example.com"
                                value={form.email} onChange={handleChange}
                            />
                        </div>
                        <div className="cu-field">
                            <label>Contact Number</label>
                            <input
                                type="tel" name="phone"
                                placeholder="Enter your phone number"
                                value={form.phone} onChange={handleChange}
                            />
                        </div>
                        <div className="cu-field">
                            <label>Message</label>
                            <textarea
                                name="message" required
                                placeholder="Describe your issue or inquiry…"
                                value={form.message} onChange={handleChange}
                            />
                        </div>
                        <button
                            type="submit"
                            className="cu-submit"
                            disabled={status === 'sending'}
                            style={{ opacity: status === 'sending' ? 0.75 : 1 }}
                        >
                            {status === 'sending' ? 'Sending…' : 'Submit Ticket'}
                        </button>
                        {status === 'success' && (
                            <div className="cu-success">✓ Ticket submitted! We'll respond within 24 hours.</div>
                        )}
                        {status === 'error' && (
                            <div className="cu-error">{errorMsg}</div>
                        )}
                    </form>
                </div>

                {/* ── RIGHT: Contact Information ── */}
                <div className="cu-right">
                    <h2>Contact Information</h2>
                    <p>Get in touch with us through any of these channels.</p>

                    {SOCIALS.map((s) => (
                        <a
                            key={s.key}
                            href={s.href}
                            target={s.key !== 'email' ? '_blank' : undefined}
                            rel="noopener noreferrer"
                            className="cu-social-row"
                        >
                            <div
                                className="cu-icon-wrap"
                                style={{ background: s.gradient || s.color }}
                            >
                                {s.icon}
                            </div>
                            <div className="cu-social-info">
                                <span className="cu-social-label">{s.label}</span>
                                <span className="cu-social-handle">{s.handle}</span>
                            </div>
                        </a>
                    ))}
                </div>

            </div>
        </section>
    );
};

export default ContactUs;
