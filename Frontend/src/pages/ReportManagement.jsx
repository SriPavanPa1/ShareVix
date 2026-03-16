import React, { useState, useEffect, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import AdminLayout from '../components/Admin/AdminLayout'
import { blogAPI } from '../services/api'
import { Search, Plus, Edit3, Trash2, FileText, CheckCircle, AlertTriangle, X, Loader } from 'lucide-react'

const ReportManagement = () => {
    const navigate = useNavigate()
    const [reports, setReports] = useState([])
    const [searchTerm, setSearchTerm] = useState('')
    const [filterCategory, setFilterCategory] = useState('all')
    const [deletingReport, setDeletingReport] = useState(null)
    const [loading, setLoading] = useState(true)
    const [actionLoading, setActionLoading] = useState(false)
    const [error, setError] = useState('')
    const [successMsg, setSuccessMsg] = useState('')
    const [pagination, setPagination] = useState({ page: 1, total: 0, totalPages: 1 })

    const fetchReports = useCallback(async () => {
        setLoading(true)
        setError('')
        try {
            const params = { page: pagination.page, limit: 50 }
            if (searchTerm) params.search = searchTerm
            if (filterCategory !== 'all') params.category = filterCategory

            const response = await blogAPI.getAdminAll(params)
            // Filter to only show Reports-tagged content
            const allBlogs = response.data.blogs || []
            const reportsOnly = allBlogs.filter(b => 
                b.tags && (
                    (Array.isArray(b.tags) && b.tags.some(t => t.toLowerCase() === 'reports')) ||
                    (typeof b.tags === 'string' && b.tags.toLowerCase() === 'reports')
                )
            )
            setReports(reportsOnly)
            setPagination(prev => ({
                ...prev,
                total: reportsOnly.length,
                totalPages: Math.ceil(reportsOnly.length / 50) || 1
            }))
        } catch (err) {
            setError(err.message || 'Failed to load reports')
        } finally {
            setLoading(false)
        }
    }, [searchTerm, filterCategory, pagination.page])

    useEffect(() => {
        fetchReports()
    }, [fetchReports])

    const [searchTimeout, setSearchTimeout] = useState(null)
    const handleSearch = (value) => {
        setSearchTerm(value)
        if (searchTimeout) clearTimeout(searchTimeout)
        setSearchTimeout(setTimeout(() => {
            setPagination(prev => ({ ...prev, page: 1 }))
        }, 500))
    }

    const categories = ['all', ...new Set(reports.map(b => b.category).filter(Boolean))]
    const publishedCount = reports.filter(b => b.is_published).length

    const handleEdit = (report) => {
        navigate(`/admin/blog-edit/${report.id}`)
    }

    const handleDelete = async () => {
        setActionLoading(true)
        try {
            await blogAPI.delete(deletingReport.id)
            setSuccessMsg('Report deleted successfully')
            setDeletingReport(null)
            await fetchReports()
            setTimeout(() => setSuccessMsg(''), 3000)
        } catch (err) {
            setError(err.message || 'Failed to delete report')
        } finally {
            setActionLoading(false)
        }
    }

    const getImageUrl = (report) => {
        if (report.featured_image_url) return report.featured_image_url
        const imageMedia = report.media?.find(m => m.asset_type === 'image')
        if (imageMedia) return `https://ik.imagekit.io/tr/${imageMedia.file_key}`
        return 'https://via.placeholder.com/400x200?text=No+Image'
    }

    const filteredReports = reports.filter(r =>
        !searchTerm ||
        r.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.description?.toLowerCase().includes(searchTerm.toLowerCase())
    ).filter(r =>
        filterCategory === 'all' || r.category === filterCategory
    )

    return (
        <AdminLayout pageTitle="Report Management" pageSubtitle="View, edit, and manage all your reports">
            {successMsg && (
                <div className="alert alert-success" style={{ marginBottom: 16 }}>
                    <CheckCircle size={20} />
                    <span>{successMsg}</span>
                </div>
            )}
            {error && (
                <div className="alert alert-error" style={{ marginBottom: 16 }}>
                    <AlertTriangle size={20} />
                    <span>{error}</span>
                    <button onClick={() => setError('')} style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer' }}>
                        <X size={16} />
                    </button>
                </div>
            )}

            {/* Stats */}
            <div className="admin-stats-row">
                <div className="admin-stat-card">
                    <div className="stat-icon blue"><FileText size={22} /></div>
                    <div className="stat-info">
                        <h3>{pagination.total}</h3>
                        <p>Total Reports</p>
                    </div>
                </div>
                <div className="admin-stat-card">
                    <div className="stat-icon green"><CheckCircle size={22} /></div>
                    <div className="stat-info">
                        <h3>{publishedCount}</h3>
                        <p>Published</p>
                    </div>
                </div>
            </div>

            {/* Toolbar */}
            <div className="admin-toolbar">
                <div className="admin-toolbar-left">
                    <div className="admin-search-box">
                        <Search size={18} />
                        <input
                            type="text"
                            placeholder="Search reports..."
                            value={searchTerm}
                            onChange={(e) => handleSearch(e.target.value)}
                        />
                    </div>
                    <select
                        className="admin-filter-select"
                        value={filterCategory}
                        onChange={(e) => {
                            setFilterCategory(e.target.value)
                            setPagination(prev => ({ ...prev, page: 1 }))
                        }}
                    >
                        {categories.map(cat => (
                            <option key={cat} value={cat}>
                                {cat === 'all' ? 'All Categories' : cat}
                            </option>
                        ))}
                    </select>
                </div>
                <Link to="/admin/blog-upload" className="admin-add-btn">
                    <Plus size={18} /> Add Report
                </Link>
            </div>

            {/* Report Cards Grid */}
            {loading ? (
                <div className="admin-empty-state">
                    <Loader size={48} className="spin-animation" />
                    <h3>Loading reports...</h3>
                </div>
            ) : filteredReports.length > 0 ? (
                <div className="admin-card-grid">
                    {filteredReports.map(report => (
                        <div key={report.id} className="admin-blog-card">
                            <div className="admin-blog-card-image">
                                <img src={getImageUrl(report)} alt={report.title} />
                                <span className={`admin-blog-card-status status-${report.is_published ? 'published' : 'draft'}`}>
                                    {report.is_published ? 'Published' : 'Draft'}
                                </span>
                            </div>
                            <div className="admin-blog-card-body">
                                <h3>{report.title}</h3>
                                <p>{report.description || report.content?.replace(/<[^>]*>/g, '').substring(0, 120) + '...'}</p>
                                <div className="admin-blog-card-meta">
                                    <span>{report.author_name || report.users?.name || 'Unknown'}</span>
                                    <span>•</span>
                                    <span>{new Date(report.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                </div>
                                {report.category && (
                                    <span className="admin-blog-card-category">{report.category}</span>
                                )}
                                <div className="admin-blog-card-actions">
                                    <button className="admin-action-btn edit" onClick={() => handleEdit(report)}>
                                        <Edit3 size={14} /> Edit
                                    </button>
                                    <button className="admin-action-btn delete" onClick={() => setDeletingReport(report)}>
                                        <Trash2 size={14} /> Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="admin-empty-state">
                    <FileText size={48} />
                    <h3>No reports found</h3>
                    <p>Upload a new report or adjust your search criteria</p>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {deletingReport && (
                <div className="admin-modal-overlay" onClick={() => setDeletingReport(null)}>
                    <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="admin-modal-header">
                            <h2>Delete Report</h2>
                            <button className="admin-modal-close" onClick={() => setDeletingReport(null)}>
                                <X size={18} />
                            </button>
                        </div>
                        <div className="admin-modal-body">
                            <div className="delete-confirm-content">
                                <AlertTriangle size={48} />
                                <h3>Are you sure you want to delete this report?</h3>
                                <p>"{deletingReport.title}" will be permanently removed. This action cannot be undone.</p>
                            </div>
                        </div>
                        <div className="admin-modal-footer">
                            <button className="btn-cancel" onClick={() => setDeletingReport(null)} disabled={actionLoading}>Cancel</button>
                            <button className="btn-delete" onClick={handleDelete} disabled={actionLoading}>
                                {actionLoading ? 'Deleting...' : 'Delete Report'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    )
}

export default ReportManagement
