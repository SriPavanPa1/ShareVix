import React, { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { ChevronDown, LogOut, Menu, X } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import logoImg from '../assets/logo.png'

const Navbar = () => {
    const { user, isAdmin, logout } = useAuth()
    const [mobileOpen, setMobileOpen] = useState(false)
    const [adminOpen, setAdminOpen] = useState(false)
    const location = useLocation()

    // Close mobile menu on route change
    useEffect(() => {
        setMobileOpen(false)
        setAdminOpen(false)
    }, [location.pathname])

    // Prevent body scroll when mobile menu is open
    useEffect(() => {
        document.body.style.overflow = mobileOpen ? 'hidden' : ''
        return () => { document.body.style.overflow = '' }
    }, [mobileOpen])

    const toggleMobile = () => setMobileOpen(prev => !prev)
    const closeMobile = () => setMobileOpen(false)

    return (
        <nav className="navbar">
            <div className="container nav-content">
                <div className="logo-area">
                    <Link to="/">
                        <img src={logoImg} alt="Hyderabad Trader Logo" className="nav-logo" />
                        <span className="logo-text">HYDERABAD TRADER</span>
                    </Link>
                </div>

                {/* Hamburger button — visible only on mobile */}
                <button
                    className="mobile-menu-btn"
                    onClick={toggleMobile}
                    aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
                >
                    {mobileOpen ? <X size={26} /> : <Menu size={26} />}
                </button>

                {/* Backdrop overlay */}
                {mobileOpen && (
                    <div className="mobile-backdrop" onClick={closeMobile} />
                )}

                {/* Navigation drawer (slides in on mobile, normal flex on desktop) */}
                <div className={`nav-drawer ${mobileOpen ? 'open' : ''}`}>
                    <ul className="nav-links">
                        <li><Link to="/" onClick={closeMobile}>Home</Link></li>
                        <li><Link to="/courses" onClick={closeMobile}>Courses</Link></li>
                        <li><Link to="/blog" onClick={closeMobile}>Blog</Link></li>
                        <li><Link to="/contact" onClick={closeMobile}>Contact Us</Link></li>

                        {isAdmin() && (
                            <li className={`dropdown ${adminOpen ? 'active' : ''}`}>
                                <button
                                    className="dropdown-toggle"
                                    onClick={() => setAdminOpen(prev => !prev)}
                                >
                                    Admin <ChevronDown size={18} className={`chevron ${adminOpen ? 'rotate' : ''}`} />
                                </button>
                                <div className={`dropdown-menu ${adminOpen ? 'show' : ''}`}>
                                    <Link to="/admin/blog-upload" className="dropdown-item" onClick={closeMobile}>
                                        Blog Upload
                                    </Link>
                                    <Link to="/admin/blog-management" className="dropdown-item" onClick={closeMobile}>
                                        Blog Management
                                    </Link>
                                    <Link to="/admin/course-upload" className="dropdown-item" onClick={closeMobile}>
                                        Course Upload
                                    </Link>
                                    <Link to="/admin/course-management" className="dropdown-item" onClick={closeMobile}>
                                        Course Management
                                    </Link>
                                </div>
                            </li>
                        )}
                    </ul>

                    <div className="nav-actions">
                        {user ? (
                            <div className="user-menu">
                                <span className="user-info">
                                    {user.name}
                                    <span className="role-badge">{user.role}</span>
                                </span>
                                <button onClick={() => { logout(); closeMobile(); }} className="logout-btn">
                                    <LogOut size={18} />
                                    Logout
                                </button>
                            </div>
                        ) : (
                            <Link to="/login" className="login-btn" onClick={closeMobile}>Login</Link>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    )
}

export default Navbar
