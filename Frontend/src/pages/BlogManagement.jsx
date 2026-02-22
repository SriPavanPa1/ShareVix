import React, { useState, useEffect, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import AdminLayout from '../components/Admin/AdminLayout'
import { blogAPI } from '../services/api'
import { Search, Plus, Edit3, Trash2, FileText, CheckCircle, Clock, AlertTriangle, X, Loader } from 'lucide-react'

const BlogManagement = () => {
    const navigate = useNavigate()
    const [blogs, setBlogs] = useState([])
    const [searchTerm, setSearchTerm] = useState('')
    const [filterCategory, setFilterCategory] = useState('all')
    const [deletingBlog, setDeletingBlog] = useState(null)
    const [loading, setLoading] = useState(true)
    const [actionLoading, setActionLoading] = useState(false)
    const [error, setError] = useState('')
    const [successMsg, setSuccessMsg] = useState('')
    const [pagination, setPagination] = useState({ page: 1, total: 0, totalPages: 1 })

    const fetchBlogs = useCallback(async () => {
        setLoading(true)
        setError('')
        try {
            const params = { page: pagination.page, limit: 50 }
            if (searchTerm) params.search = searchTerm
            if (filterCategory !== 'all') params.category = filterCategory

            const response = await blogAPI.getAdminAll(params)
            setBlogs(response.data.blogs || [])
            setPagination(prev => ({
                ...prev,
                total: response.data.pagination?.total || 0,
                totalPages: response.data.pagination?.totalPages || 1
            }))
        } catch (err) {
            setError(err.message || 'Failed to load blogs')
        } finally {
            setLoading(false)
        }
    }, [searchTerm, filterCategory, pagination.page])

    useEffect(() => {
        fetchBlogs()
    }, [fetchBlogs])

    // Debounce search
    const [searchTimeout, setSearchTimeout] = useState(null)
    const handleSearch = (value) => {
        setSearchTerm(value)
        if (searchTimeout) clearTimeout(searchTimeout)
        setSearchTimeout(setTimeout(() => {
            setPagination(prev => ({ ...prev, page: 1 }))
        }, 500))
    }

    const categories = ['all', ...new Set(blogs.map(b => b.category).filter(Boolean))]
    const publishedCount = blogs.filter(b => b.is_published).length
    const draftCount = blogs.filter(b => !b.is_published).length

    const handleEdit = (blog) => {
        navigate(`/admin/blog-edit/${blog.id}`)
    }


    const handleDelete = async () => {
        setActionLoading(true)
        try {
            await blogAPI.delete(deletingBlog.id)
            setSuccessMsg('Blog deleted successfully')
            setDeletingBlog(null)
            await fetchBlogs()
            setTimeout(() => setSuccessMsg(''), 3000)
        } catch (err) {
            setError(err.message || 'Failed to delete blog')
        } finally {
            setActionLoading(false)
        }
    }

    const getImageUrl = (blog) => {
        if (blog.featured_image_url) return blog.featured_image_url
        const imageMedia = blog.media?.find(m => m.asset_type === 'image')
        if (imageMedia) return `https://ik.imagekit.io/tr/${imageMedia.file_key}`
        return 'https://via.placeholder.com/400x200?text=No+Image'
    }

    return (
        <AdminLayout pageTitle="Blog Management" pageSubtitle="View, edit, and manage all your blog posts">
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
                        <p>Total Blogs</p>
                    </div>
                </div>
                <div className="admin-stat-card">
                    <div className="stat-icon green"><CheckCircle size={22} /></div>
                    <div className="stat-info">
                        <h3>{publishedCount}</h3>
                        <p>Published</p>
                    </div>
                </div>
                {/* <div className="admin-stat-card">
                    <div className="stat-icon orange"><Clock size={22} /></div>
                    <div className="stat-info">
                        <h3>{draftCount}</h3>
                        <p>Drafts</p>
                    </div>
                </div> */}
            </div>

            {/* Toolbar */}
            <div className="admin-toolbar">
                <div className="admin-toolbar-left">
                    <div className="admin-search-box">
                        <Search size={18} />
                        <input
                            type="text"
                            placeholder="Search blogs..."
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
                    <Plus size={18} /> Add Blog
                </Link>
            </div>

            {/* Blog Cards Grid */}
            {loading ? (
                <div className="admin-empty-state">
                    <Loader size={48} className="spin-animation" />
                    <h3>Loading blogs...</h3>
                </div>
            ) : blogs.length > 0 ? (
                <div className="admin-card-grid">
                    {blogs.map(blog => (
                        <div key={blog.id} className="admin-blog-card">
                            <div className="admin-blog-card-image">
                                <img src={getImageUrl(blog)} alt={blog.title} />
                                <span className={`admin-blog-card-status status-${blog.is_published ? 'published' : 'draft'}`}>
                                    {blog.is_published ? 'Published' : 'Draft'}
                                </span>
                            </div>
                            <div className="admin-blog-card-body">
                                <h3>{blog.title}</h3>
                                <p>{blog.description || blog.content?.replace(/<[^>]*>/g, '').substring(0, 120) + '...'}</p>
                                <div className="admin-blog-card-meta">
                                    <span>{blog.author_name || blog.users?.name || 'Unknown'}</span>
                                    <span>•</span>
                                    <span>{new Date(blog.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                </div>
                                {blog.category && (
                                    <span className="admin-blog-card-category">{blog.category}</span>
                                )}
                                <div className="admin-blog-card-actions">
                                    <button className="admin-action-btn edit" onClick={() => handleEdit(blog)}>
                                        <Edit3 size={14} /> Edit
                                    </button>
                                    <button className="admin-action-btn delete" onClick={() => setDeletingBlog(blog)}>
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
                    <h3>No blogs found</h3>
                    <p>Try adjusting your search or filter criteria</p>
                </div>
            )}


            {/* Delete Confirmation Modal */}
            {deletingBlog && (
                <div className="admin-modal-overlay" onClick={() => setDeletingBlog(null)}>
                    <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="admin-modal-header">
                            <h2>Delete Blog</h2>
                            <button className="admin-modal-close" onClick={() => setDeletingBlog(null)}>
                                <X size={18} />
                            </button>
                        </div>
                        <div className="admin-modal-body">
                            <div className="delete-confirm-content">
                                <AlertTriangle size={48} />
                                <h3>Are you sure you want to delete this blog?</h3>
                                <p>"{deletingBlog.title}" will be permanently removed. This action cannot be undone.</p>
                            </div>
                        </div>
                        <div className="admin-modal-footer">
                            <button className="btn-cancel" onClick={() => setDeletingBlog(null)} disabled={actionLoading}>Cancel</button>
                            <button className="btn-delete" onClick={handleDelete} disabled={actionLoading}>
                                {actionLoading ? 'Deleting...' : 'Delete Blog'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    )
}

export default BlogManagement
