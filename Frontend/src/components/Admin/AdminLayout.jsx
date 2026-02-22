import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import {
    LayoutDashboard,
    FileText,
    BookOpen,
    Upload,
    PenSquare,
    Table2,
    ChevronLeft,
    ChevronRight,
    AlertCircle,
    Menu,
    X
} from 'lucide-react'
import '../../styles/AdminLayout.css'

const adminNavItems = [
    {
        label: 'Blog Upload',
        path: '/admin/blog-upload',
        icon: PenSquare
    },
    {
        label: 'Blog Management',
        path: '/admin/blog-management',
        icon: FileText
    },
    {
        label: 'Course Upload',
        path: '/admin/course-upload',
        icon: Upload
    },
    {
        label: 'Course Management',
        path: '/admin/course-management',
        icon: BookOpen
    }
]

const AdminLayout = ({ children, pageTitle, pageSubtitle }) => {
    const { isAdmin, user } = useAuth()
    const location = useLocation()
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

    if (!isAdmin()) {
        return (
            <div className="admin-access-denied">
                <div className="admin-denied-card">
                    <AlertCircle size={56} />
                    <h2>Access Denied</h2>
                    <p>You don't have permission to access this page. Only administrators can access the admin panel.</p>
                    <Link to="/" className="admin-back-home">Go Back Home</Link>
                </div>
            </div>
        )
    }

    return (
        <div className={`admin-layout ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
            {/* Mobile menu toggle */}
            <button
                className="mobile-menu-toggle"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            {/* Sidebar */}
            <aside className={`admin-sidebar ${mobileMenuOpen ? 'mobile-open' : ''}`}>
                <div className="sidebar-header">
                    <div className="sidebar-brand">
                        <LayoutDashboard size={24} />
                        {!sidebarCollapsed && <span>Admin Panel</span>}
                    </div>
                    <button
                        className="sidebar-toggle"
                        onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                    >
                        {sidebarCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
                    </button>
                </div>

                <nav className="sidebar-nav">
                    {adminNavItems.map((item) => {
                        const Icon = item.icon
                        const isActive = location.pathname === item.path
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`sidebar-nav-item ${isActive ? 'active' : ''}`}
                                onClick={() => setMobileMenuOpen(false)}
                                title={sidebarCollapsed ? item.label : ''}
                            >
                                <Icon size={20} />
                                {!sidebarCollapsed && <span>{item.label}</span>}
                            </Link>
                        )
                    })}
                </nav>

                <div className="sidebar-footer">
                    <div className="sidebar-user">
                        <div className="sidebar-user-avatar">
                            {user?.name?.charAt(0) || 'A'}
                        </div>
                        {!sidebarCollapsed && (
                            <div className="sidebar-user-info">
                                <span className="sidebar-user-name">{user?.name || 'Admin'}</span>
                                <span className="sidebar-user-role">Administrator</span>
                            </div>
                        )}
                    </div>
                </div>
            </aside>

            {/* Overlay for mobile */}
            {mobileMenuOpen && (
                <div className="sidebar-overlay" onClick={() => setMobileMenuOpen(false)} />
            )}

            {/* Main Content */}
            <main className="admin-main">
                <div className="admin-page-header">
                    <div>
                        <h1>{pageTitle || 'Admin Dashboard'}</h1>
                        {pageSubtitle && <p>{pageSubtitle}</p>}
                    </div>
                </div>
                <div className="admin-page-content">
                    {children}
                </div>
            </main>
        </div>
    )
}

export default AdminLayout
