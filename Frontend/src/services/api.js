import axios from 'axios'

// Base API configuration import.meta.env.VITE_API_URL ||
const API_BASE_URL = 'http://localhost:8787'

const api = axios.create({
    baseURL: `${API_BASE_URL}/api`,
    headers: {
        'Content-Type': 'application/json'
    }
})

// Request interceptor - attach auth token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('authToken')
        if (token) {
            config.headers.Authorization = `Bearer ${token}`
        }
        return config
    },
    (error) => Promise.reject(error)
)

// Response interceptor - handle errors globally
api.interceptors.response.use(
    (response) => response.data,
    (error) => {
        const message = error.response?.data?.error || error.message || 'Something went wrong'

        // Auto logout on 401
        if (error.response?.status === 401) {
            localStorage.removeItem('user')
            localStorage.removeItem('authToken')
            window.location.href = '/login'
        }

        return Promise.reject({ message, status: error.response?.status })
    }
)

// ============ AUTH API ============
export const authAPI = {
    login: (email, password) =>
        api.post('/auth/login', { email, password }),

    register: (data) =>
        api.post('/auth/register', data),

    forgotPassword: (email) =>
        api.post('/auth/forgot-password', { email }),

    getCurrentUser: () =>
        api.get('/auth/me')
}

// ============ BLOG API ============
export const blogAPI = {
    // Public - get published blogs
    getAll: (params = {}) =>
        api.get('/blogs', { params }),

    // Admin - get all blogs (published + drafts)
    getAdminAll: (params = {}) =>
        api.get('/admin/blogs', { params }),

    // Get single blog by ID
    getById: (id) =>
        api.get(`/blogs/${id}`),

    // Create blog (JSON)
    create: (data) =>
        api.post('/blogs', data),

    // Create blog with media (FormData)
    createWithMedia: (formData) =>
        api.post('/blogs/with-media', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        }),

    // Upload media to existing blog
    uploadMedia: (blogId, formData) =>
        api.post(`/blogs/${blogId}/media`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        }),

    // Update blog
    update: (id, data) =>
        api.put(`/blogs/${id}`, data),

    // Update blog with media (FormData)
    updateWithMedia: (id, formData) =>
        api.put(`/blogs/${id}/with-media`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        }),

    // Delete blog
    delete: (id) =>
        api.delete(`/blogs/${id}`),

    // Get my blogs
    getMyBlogs: (params = {}) =>
        api.get('/blogs/my', { params })
}

// ============ COURSE API ============
export const courseAPI = {
    // Public - get active courses
    getAll: (params = {}) =>
        api.get('/courses', { params }),

    // Admin - get all courses (active + inactive)
    getAdminAll: (params = {}) =>
        api.get('/admin/courses', { params }),

    // Get single course by ID
    getById: (id) =>
        api.get(`/courses/${id}`),

    // Create course (JSON)
    create: (data) =>
        api.post('/courses', data),

    // Create course with media (FormData)
    createWithMedia: (formData) =>
        api.post('/courses/with-media', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        }),

    // Upload media to existing course
    uploadMedia: (courseId, formData) =>
        api.post(`/courses/${courseId}/media`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        }),

    // Update course
    update: (id, data) =>
        api.put(`/courses/${id}`, data),

    // Update course with media (FormData)
    updateWithMedia: (id, formData) =>
        api.put(`/courses/${id}/with-media`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        }),

    // Delete course
    delete: (id) =>
        api.delete(`/courses/${id}`),

    // Purchase/enroll
    purchase: (courseId, accessExpiry) =>
        api.post('/courses/purchase', { course_id: courseId, access_expiry: accessExpiry }),

    // Get user's enrolled courses
    getUserCourses: (userId) =>
        api.get(`/users/${userId}/courses`)
}

// ============ USER API ============
export const userAPI = {
    getAll: (params = {}) =>
        api.get('/users', { params }),

    getById: (id) =>
        api.get(`/users/${id}`),

    update: (id, data) =>
        api.put(`/users/${id}`, data),

    delete: (id) =>
        api.delete(`/users/${id}`),

    assignRole: (userId, roleId) =>
        api.post('/users/roles/assign', { user_id: userId, role_id: roleId }),

    removeRole: (userId, roleId) =>
        api.post('/users/roles/remove', { user_id: userId, role_id: roleId }),

    getAllRoles: () =>
        api.get('/roles')
}

// ============ MEDIA API ============
export const mediaAPI = {
    getAuthParams: () =>
        api.get('/media/auth'),

    list: (params = {}) =>
        api.get('/media', { params }),

    register: (data) =>
        api.post('/media', data),

    upload: (formData) =>
        api.post('/media/upload', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        }),

    delete: (id) =>
        api.delete(`/media/${id}`),

    uploadInline: (formData) =>
        api.post('/media/upload-inline', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        })
}

// ============ PAYMENT API ============
export const paymentAPI = {
    getAll: (params = {}) =>
        api.get('/payments', { params }),

    getById: (id) =>
        api.get(`/payments/${id}`),

    create: (data) =>
        api.post('/payments', data),

    updateStatus: (id, data) =>
        api.put(`/payments/${id}`, data),

    getUserPayments: (userId) =>
        api.get(`/users/${userId}/payments`)
}

export default api
