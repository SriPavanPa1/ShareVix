import React, { useState, useEffect, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import AdminLayout from '../components/Admin/AdminLayout'
import { courseAPI } from '../services/api'
import { Search, Plus, Edit3, Trash2, BookOpen, Users, Star, DollarSign, AlertTriangle, X, CheckCircle, Loader } from 'lucide-react'

const CourseManagement = () => {
    const navigate = useNavigate()
    const [courses, setCourses] = useState([])
    const [searchTerm, setSearchTerm] = useState('')
    const [filterLevel, setFilterLevel] = useState('all')
    const [deletingCourse, setDeletingCourse] = useState(null)
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
        if (imageMedia) return imageMedia.url || `https://ik.imagekit.io/tr/${imageMedia.file_key}`
        return 'https://via.placeholder.com/60x40?text=No+Image'
    }

    const stripHtml = (html) => {
        const tmp = document.createElement("DIV");
        tmp.innerHTML = html;
        return tmp.textContent || tmp.innerText || "";
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
                                            <div className="table-course-details">
                                                <span className="table-course-name">{course.title}</span>
                                                <p className="table-course-desc">
                                                    {stripHtml(course.description || '').substring(0, 60)}...
                                                </p>
                                            </div>
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
                                            <button className="table-action-btn edit" onClick={() => navigate(`/admin/course-edit/${course.id}`)} title="Edit">
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
