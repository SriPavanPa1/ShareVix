import { authenticate, optionalAuth } from './middleware/auth.js';
import { errorResponse } from './utils/response.js';
import * as authRoutes from './routes/auth.js';
import * as userRoutes from './routes/users.js';
import * as courseRoutes from './routes/courses.js';
import * as blogRoutes from './routes/blogs.js';
import * as mediaRoutes from './routes/media.js';
import * as paymentRoutes from './routes/payments.js';

// UUIDs pattern for route matching
const UUID_PATTERN = '[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}';

export async function handleRequest(request, env, supabase) {
    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method;

    // CORS preflight
    if (method === 'OPTIONS') {
        return new Response(null, {
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization',
                'Access-Control-Max-Age': '86400'
            }
        });
    }

    // Health check
    if (path === '/api/health' && method === 'GET') {
        return new Response(JSON.stringify({ status: 'ok', timestamp: new Date().toISOString() }), {
            headers: { 'Content-Type': 'application/json' }
        });
    }

    // ============ PUBLIC ROUTES ============

    // Auth - Public
    if (path === '/api/auth/register' && method === 'POST') {
        return authRoutes.register(request, env, supabase);
    }
    if (path === '/api/auth/login' && method === 'POST') {
        return authRoutes.login(request, env, supabase);
    }
    if (path === '/api/auth/forgot-password' && method === 'POST') {
        return authRoutes.forgotPassword(request, env, supabase);
    }

    // Courses - Public listing
    if (path === '/api/courses' && method === 'GET') {
        return courseRoutes.getAllCourses(request, env, supabase);
    }
    if (path.match(new RegExp(`^/api/courses/${UUID_PATTERN}$`)) && method === 'GET') {
        const courseId = path.split('/')[3];
        return courseRoutes.getCourseById(request, env, supabase, courseId);
    }

    // Blogs - Public listing
    if (path === '/api/blogs' && method === 'GET') {
        return blogRoutes.getAllBlogs(request, env, supabase);
    }
    if (path.match(new RegExp(`^/api/blogs/${UUID_PATTERN}$`)) && method === 'GET') {
        const blogId = path.split('/')[3];
        // Optional auth for viewing unpublished blogs
        const authResult = await optionalAuth(request, env, supabase);
        return blogRoutes.getBlogById(request, env, supabase, blogId, authResult.user);
    }

    // ============ PROTECTED ROUTES ============

    // Authenticate all routes below
    const authResult = await authenticate(request, env, supabase);
    if (authResult.error) return authResult.error;
    const user = authResult.user;

    // Auth - Protected
    if (path === '/api/auth/me' && method === 'GET') {
        return authRoutes.getCurrentUser(request, env, supabase, user);
    }

    // --- Users ---
    if (path === '/api/users' && method === 'GET') {
        return userRoutes.getAllUsers(request, env, supabase, user);
    }
    if (path.match(new RegExp(`^/api/users/${UUID_PATTERN}$`)) && method === 'GET') {
        const userId = path.split('/')[3];
        return userRoutes.getUserById(request, env, supabase, user, userId);
    }
    if (path.match(new RegExp(`^/api/users/${UUID_PATTERN}$`)) && method === 'PUT') {
        const userId = path.split('/')[3];
        return userRoutes.updateUser(request, env, supabase, user, userId);
    }
    if (path.match(new RegExp(`^/api/users/${UUID_PATTERN}$`)) && method === 'DELETE') {
        const userId = path.split('/')[3];
        return userRoutes.deleteUser(request, env, supabase, user, userId);
    }
    if (path === '/api/users/roles/assign' && method === 'POST') {
        return userRoutes.assignRole(request, env, supabase, user);
    }
    if (path === '/api/users/roles/remove' && method === 'POST') {
        return userRoutes.removeRole(request, env, supabase, user);
    }
    if (path === '/api/roles' && method === 'GET') {
        return userRoutes.getAllRoles(request, env, supabase, user);
    }

    // --- Courses (Protected) ---
    if (path === '/api/courses' && method === 'POST') {
        return courseRoutes.createCourse(request, env, supabase, user);
    }
    // Create course with file uploads (form-data)
    if (path === '/api/courses/with-media' && method === 'POST') {
        return courseRoutes.createCourseWithMedia(request, env, supabase, user);
    }
    // Upload files to existing course (form-data)
    if (path.match(new RegExp(`^/api/courses/${UUID_PATTERN}/media$`)) && method === 'POST') {
        const courseId = path.split('/')[3];
        return courseRoutes.uploadCourseMedia(request, env, supabase, user, courseId);
    }
    if (path.match(new RegExp(`^/api/courses/${UUID_PATTERN}$`)) && method === 'PUT') {
        const courseId = path.split('/')[3];
        return courseRoutes.updateCourse(request, env, supabase, user, courseId);
    }
    if (path.match(new RegExp(`^/api/courses/${UUID_PATTERN}$`)) && method === 'DELETE') {
        const courseId = path.split('/')[3];
        return courseRoutes.deleteCourse(request, env, supabase, user, courseId);
    }
    if (path === '/api/courses/purchase' && method === 'POST') {
        return courseRoutes.purchaseCourse(request, env, supabase, user);
    }
    if (path.match(new RegExp(`^/api/users/${UUID_PATTERN}/courses$`)) && method === 'GET') {
        const userId = path.split('/')[3];
        return courseRoutes.getUserCourses(request, env, supabase, user, userId);
    }

    // --- Blogs (Protected) ---
    if (path === '/api/blogs' && method === 'POST') {
        return blogRoutes.createBlog(request, env, supabase, user);
    }
    // Create blog with file uploads (form-data)
    if (path === '/api/blogs/with-media' && method === 'POST') {
        return blogRoutes.createBlogWithMedia(request, env, supabase, user);
    }
    // Upload files to existing blog (form-data)
    if (path.match(new RegExp(`^/api/blogs/${UUID_PATTERN}/media$`)) && method === 'POST') {
        const blogId = path.split('/')[3];
        return blogRoutes.uploadBlogMedia(request, env, supabase, user, blogId);
    }
    if (path === '/api/blogs/my' && method === 'GET') {
        return blogRoutes.getMyBlogs(request, env, supabase, user);
    }
    if (path.match(new RegExp(`^/api/blogs/${UUID_PATTERN}$`)) && method === 'PUT') {
        const blogId = path.split('/')[3];
        return blogRoutes.updateBlog(request, env, supabase, user, blogId);
    }
    if (path.match(new RegExp(`^/api/blogs/${UUID_PATTERN}$`)) && method === 'DELETE') {
        const blogId = path.split('/')[3];
        return blogRoutes.deleteBlog(request, env, supabase, user, blogId);
    }

    // --- Admin Routes ---
    if (path === '/api/admin/blogs' && method === 'GET') {
        return blogRoutes.getAllBlogsAdmin(request, env, supabase, user);
    }
    if (path === '/api/admin/courses' && method === 'GET') {
        return courseRoutes.getAllCoursesAdmin(request, env, supabase, user);
    }

    // --- Media ---
    if (path === '/api/media/auth' && method === 'GET') {
        return mediaRoutes.getAuthParams(request, env, supabase, user);
    }
    if (path === '/api/media' && method === 'GET') {
        return mediaRoutes.listMedia(request, env, supabase, user);
    }
    if (path === '/api/media' && method === 'POST') {
        return mediaRoutes.registerMedia(request, env, supabase, user);
    }
    if (path === '/api/media/upload' && method === 'POST') {
        return mediaRoutes.uploadMedia(request, env, supabase, user);
    }
    if (path.match(new RegExp(`^/api/media/${UUID_PATTERN}$`)) && method === 'DELETE') {
        const mediaId = path.split('/')[3];
        return mediaRoutes.deleteMedia(request, env, supabase, user, mediaId);
    }

    // --- Payments ---
    if (path === '/api/payments' && method === 'GET') {
        return paymentRoutes.getAllPayments(request, env, supabase, user);
    }
    if (path === '/api/payments' && method === 'POST') {
        return paymentRoutes.createPayment(request, env, supabase, user);
    }
    if (path.match(new RegExp(`^/api/payments/${UUID_PATTERN}$`)) && method === 'GET') {
        const paymentId = path.split('/')[3];
        return paymentRoutes.getPaymentById(request, env, supabase, user, paymentId);
    }
    if (path.match(new RegExp(`^/api/payments/${UUID_PATTERN}$`)) && method === 'PUT') {
        const paymentId = path.split('/')[3];
        return paymentRoutes.updatePaymentStatus(request, env, supabase, user, paymentId);
    }
    if (path.match(new RegExp(`^/api/users/${UUID_PATTERN}/payments$`)) && method === 'GET') {
        const userId = path.split('/')[3];
        return paymentRoutes.getUserPayments(request, env, supabase, user, userId);
    }

    // Not found
    return errorResponse('Not found', 404);
}
