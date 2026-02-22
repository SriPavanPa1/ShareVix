import React from 'react'
import { Link } from 'react-router-dom'
import { ChevronDown, LogOut } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import logoImg from '../assets/logo.png'

const Navbar = () => {
    const { user, isAdmin, logout } = useAuth()

    return (
        <nav className="navbar">
            <div className="container nav-content">
                <div className="logo-area">
                    <Link to="/">
                        <img src={logoImg} alt="Hyderabad Trader Logo" className="nav-logo" />
                        <span className="logo-text">HYDERABAD TRADER</span>
                    </Link>
                </div>

                <ul className="nav-links">
                    <li><Link to="/">Home</Link></li>
                    <li><Link to="/courses">Courses</Link></li>
                    <li><Link to="/blog">Blog</Link></li>
                    {/* <li><Link to="/membership">Join The Membership</Link></li> */}
                    <li><Link to="/contact">Contact Us</Link></li>

                    {isAdmin() && (
                        <li className="dropdown">
                            <button className="dropdown-toggle">
                                Admin <ChevronDown size={18} />
                            </button>
                            <div className="dropdown-menu">
                                <Link to="/admin/blog-upload" className="dropdown-item">
                                    Blog Upload
                                </Link>
                                <Link to="/admin/blog-management" className="dropdown-item">
                                    Blog Management
                                </Link>
                                <Link to="/admin/course-upload" className="dropdown-item">
                                    Course Upload
                                </Link>
                                <Link to="/admin/course-management" className="dropdown-item">
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
                            <button onClick={logout} className="logout-btn">
                                <LogOut size={18} />
                                Logout
                            </button>
                        </div>
                    ) : (
                        <Link to="/login" className="login-btn">Login</Link>
                    )}
                </div>
            </div>
        </nav>
    )
}

export default Navbar
