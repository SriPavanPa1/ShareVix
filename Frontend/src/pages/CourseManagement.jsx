import React, { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import AdminLayout from '../components/Admin/AdminLayout'
import { courseAPI } from '../services/api'
import { Search, Plus, Edit3, Trash2, BookOpen, Users, Star, DollarSign, AlertTriangle, X, CheckCircle, Loader } from 'lucide-react'

const CourseManagement = () => {
    const [courses, setCourses] = useState([])
    const [searchTerm, setSearchTerm] = useState('')
    const [filterLevel, setFilterLevel] = useState('all')
    const [editingCourse, setEditingCourse] = useState(null)
    const [deletingCourse, setDeletingCourse] = useState(null)
    const [editForm, setEditForm] = useState({})
    const [loading, setLoading] = useState(true)
    const [actionLoading, setActionLoading] = useState(false)
    const [error, setError] = useState('')
    const [successMsg, setSuccessMsg] = useState('')
    const [pagination, setPagination] = useState({ page: 1, total: 0, totalPages: 1 })

    const fetchCourses = useCallback(async () => {
        setLoading(true)
        setError('')
        try {
            const params = { page: pagination.page, limit: 50 }
            if (searchTerm) params.search = searchTerm
            if (filterLevel !== 'all') params.level = filterLevel

            const response = await courseAPI.getAdminAll(params)
            setCourses(response.data.courses || [])
            setPagination(prev => ({
                ...prev,
                total: response.data.pagination?.total || 0,
                totalPages: response.data.pagination?.totalPages || 1
            }))
        } catch (err) {
            setError(err.message || 'Failed to load courses')
        } finally {
            setLoading(false)
        }
    }, [searchTerm, filterLevel, pagination.page])

    useEffect(() => {
        fetchCourses()
    }, [fetchCourses])

    // Debounce search
    const [searchTimeout, setSearchTimeout] = useState(null)
    const handleSearch = (value) => {
        setSearchTerm(value)
        if (searchTimeout) clearTimeout(searchTimeout)
        setSearchTimeout(setTimeout(() => {
            setPagination(prev => ({ ...prev, page: 1 }))
        }, 500))
    }

    const activeCount = courses.filter(c => c.is_active).length
    const totalRevenue = courses.reduce((sum, c) => sum + (c.price || 0), 0)

    const handleEdit = (course) => {
        setEditForm({
            id: course.id,
            title: course.title || '',
            description: course.description || '',
            instructor_name: course.instructor_name || '',
            category: course.category || '',
            level: course.level || 'Beginner',
            price: course.price || 0,
            duration: course.duration || '',
            is_active: course.is_active
        })
        setEditingCourse(course)
    }

    const handleSaveEdit = async () => {
        setActionLoading(true)
        try {
            await courseAPI.update(editForm.id, {
                title: editForm.title,
                description: editForm.description,
                instructor_name: editForm.instructor_name,
                category: editForm.category,
                level: editForm.level,
                price: Number(editForm.price),
                duration: editForm.duration,
                is_active: editForm.is_active
            })
            setSuccessMsg('Course updated successfully')
            setEditingCourse(null)
            setEditForm({})
            await fetchCourses()
            setTimeout(() => setSuccessMsg(''), 3000)
        } catch (err) {
            setError(err.message || 'Failed to update course')
        } finally {
            setActionLoading(false)
        }
    }

    const handleDelete = async () => {
        setActionLoading(true)
        try {
            await courseAPI.delete(deletingCourse.id)
            setSuccessMsg('Course deleted successfully')
            setDeletingCourse(null)
            await fetchCourses()
            setTimeout(() => setSuccessMsg(''), 3000)
        } catch (err) {
            setError(err.message || 'Failed to delete course')
        } finally {
            setActionLoading(false)
        }
    }

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount || 0)
    }

    const getImageUrl = (course) => {
        const imageMedia = course.media?.find(m => m.asset_type === 'image')
        if (imageMedia) return `https://ik.imagekit.io/tr/${imageMedia.file_key}`
        return 'https://via.placeholder.com/60x40?text=No+Image'
    }

    return (
        <AdminLayout pageTitle="Course Management" pageSubtitle="View, edit, and manage all your courses">
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
                    <div className="stat-icon blue"><BookOpen size={22} /></div>
                    <div className="stat-info">
                        <h3>{pagination.total}</h3>
                        <p>Total Courses</p>
                    </div>
                </div>
                <div className="admin-stat-card">
                    <div className="stat-icon green"><Users size={22} /></div>
                    <div className="stat-info">
                        <h3>{activeCount}</h3>
                        <p>Active</p>
                    </div>
                </div>
                <div className="admin-stat-card">
                    <div className="stat-icon orange"><DollarSign size={22} /></div>
                    <div className="stat-info">
                        <h3>{formatCurrency(totalRevenue)}</h3>
                        <p>Total Price</p>
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
                            placeholder="Search courses..."
                            value={searchTerm}
                            onChange={(e) => handleSearch(e.target.value)}
                        />
                    </div>
                    <select
                        className="admin-filter-select"
                        value={filterLevel}
                        onChange={(e) => {
                            setFilterLevel(e.target.value)
                            setPagination(prev => ({ ...prev, page: 1 }))
                        }}
                    >
                        <option value="all">All Levels</option>
                        <option value="beginner">Beginner</option>
                        <option value="intermediate">Intermediate</option>
                        <option value="advanced">Advanced</option>
                    </select>
                </div>
                <Link to="/admin/course-upload" className="admin-add-btn">
                    <Plus size={18} /> Add Course
                </Link>
            </div>

            {/* Table */}
            {loading ? (
                <div className="admin-empty-state">
                    <Loader size={48} className="spin-animation" />
                    <h3>Loading courses...</h3>
                </div>
            ) : courses.length > 0 ? (
                <div className="admin-table-wrapper">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Course</th>
                                <th>Instructor</th>
                                <th>Category</th>
                                <th>Level</th>
                                <th>Price</th>
                                <th>Duration</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {courses.map(course => (
                                <tr key={course.id}>
                                    <td>
                                        <div className="table-course-info">
                                            <img src={getImageUrl(course)} alt={course.title} className="table-course-img" />
                                            <span className="table-course-name">{course.title}</span>
                                        </div>
                                    </td>
                                    <td>{course.instructor_name || course.creator_name || 'N/A'}</td>
                                    <td>{course.category || 'N/A'}</td>
                                    <td>
                                        <span className={`table-badge badge-${(course.level || 'beginner').toLowerCase()}`}>
                                            {course.level || 'Beginner'}
                                        </span>
                                    </td>
                                    <td><strong>{course.is_paid ? formatCurrency(course.price) : 'Free'}</strong></td>
                                    <td>{course.duration || 'N/A'}</td>
                                    <td>
                                        <span className={`admin-blog-card-status status-${course.is_active ? 'published' : 'draft'}`} style={{ position: 'static' }}>
                                            {course.is_active ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="table-actions">
                                            <button className="table-action-btn edit" onClick={() => handleEdit(course)} title="Edit">
                                                <Edit3 size={16} />
                                            </button>
                                            <button className="table-action-btn delete" onClick={() => setDeletingCourse(course)} title="Delete">
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="admin-empty-state">
                    <BookOpen size={48} />
                    <h3>No courses found</h3>
                    <p>Try adjusting your search or filter criteria</p>
                </div>
            )}

            {/* Edit Modal */}
            {editingCourse && (
                <div className="admin-modal-overlay" onClick={() => setEditingCourse(null)}>
                    <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="admin-modal-header">
                            <h2>Edit Course</h2>
                            <button className="admin-modal-close" onClick={() => setEditingCourse(null)}>
                                <X size={18} />
                            </button>
                        </div>
                        <div className="admin-modal-body">
                            <div className="form-group">
                                <label>Course Name</label>
                                <input
                                    type="text"
                                    value={editForm.title || ''}
                                    onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                                />
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Instructor</label>
                                    <input
                                        type="text"
                                        value={editForm.instructor_name || ''}
                                        onChange={(e) => setEditForm({ ...editForm, instructor_name: e.target.value })}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Category</label>
                                    <select
                                        value={editForm.category || ''}
                                        onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                                    >
                                        <option value="">Select Category</option>
                                        <option value="Trading">Trading</option>
                                        <option value="Investing">Investing</option>
                                        <option value="Cryptocurrency">Cryptocurrency</option>
                                        <option value="Market Fundamentals">Market Fundamentals</option>
                                    </select>
                                </div>
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Level</label>
                                    <select
                                        value={editForm.level || ''}
                                        onChange={(e) => setEditForm({ ...editForm, level: e.target.value })}
                                    >
                                        <option value="Beginner">Beginner</option>
                                        <option value="Intermediate">Intermediate</option>
                                        <option value="Advanced">Advanced</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Price (₹)</label>
                                    <input
                                        type="number"
                                        value={editForm.price || ''}
                                        onChange={(e) => setEditForm({ ...editForm, price: Number(e.target.value) })}
                                    />
                                </div>
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Duration</label>
                                    <input
                                        type="text"
                                        value={editForm.duration || ''}
                                        onChange={(e) => setEditForm({ ...editForm, duration: e.target.value })}
                                        placeholder="e.g., 40 hours"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Status</label>
                                    <select
                                        value={editForm.is_active ? 'active' : 'inactive'}
                                        onChange={(e) => setEditForm({ ...editForm, is_active: e.target.value === 'active' })}
                                    >
                                        <option value="active">Active</option>
                                        <option value="inactive">Inactive</option>
                                    </select>
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Description</label>
                                <textarea
                                    value={editForm.description || ''}
                                    onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                                    rows="3"
                                />
                            </div>
                        </div>
                        <div className="admin-modal-footer">
                            <button className="btn-cancel" onClick={() => setEditingCourse(null)} disabled={actionLoading}>Cancel</button>
                            <button className="btn-save" onClick={handleSaveEdit} disabled={actionLoading}>
                                {actionLoading ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {deletingCourse && (
                <div className="admin-modal-overlay" onClick={() => setDeletingCourse(null)}>
                    <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="admin-modal-header">
                            <h2>Delete Course</h2>
                            <button className="admin-modal-close" onClick={() => setDeletingCourse(null)}>
                                <X size={18} />
                            </button>
                        </div>
                        <div className="admin-modal-body">
                            <div className="delete-confirm-content">
                                <AlertTriangle size={48} />
                                <h3>Are you sure you want to delete this course?</h3>
                                <p>"{deletingCourse.title}" will be deactivated. This action can be reversed by an admin.</p>
                            </div>
                        </div>
                        <div className="admin-modal-footer">
                            <button className="btn-cancel" onClick={() => setDeletingCourse(null)} disabled={actionLoading}>Cancel</button>
                            <button className="btn-delete" onClick={handleDelete} disabled={actionLoading}>
                                {actionLoading ? 'Deleting...' : 'Delete Course'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    )
}

export default CourseManagement
