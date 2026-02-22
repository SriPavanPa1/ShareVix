import { errorResponse } from '../utils/response.js';

/**
 * Check if user has required role(s)
 * @param {Object} user - User object with roles array
 * @param {string|string[]} requiredRoles - Role name(s) to check
 * @returns {Response|null} - Error response or null if authorized
 */
export function requireRole(user, requiredRoles) {
    const roles = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];

    if (!user.roles || !user.roles.length) {
        return errorResponse('No roles assigned', 403);
    }

    const hasRequiredRole = roles.some(role => user.roles.includes(role));

    if (!hasRequiredRole) {
        return errorResponse(`Access denied. Required role: ${roles.join(' or ')}`, 403);
    }

    return null;
}

/**
 * Check if user is admin
 */
export function requireAdmin(user) {
    return requireRole(user, 'admin');
}

/**
 * Check if user is admin or instructor
 */
export function requireAdminOrInstructor(user) {
    return requireRole(user, ['admin', 'instructor']);
}

/**
 * Check if user is admin or author
 */
export function requireAdminOrAuthor(user) {
    return requireRole(user, ['admin', 'author']);
}

/**
 * Check if user is the owner of a resource or has admin role
 * @param {Object} user - User object
 * @param {string} resourceUserId - User ID of resource owner
 */
export function requireOwnerOrAdmin(user, resourceUserId) {
    if (user.userId === resourceUserId) {
        return null; // Owner
    }

    if (user.roles && user.roles.includes('admin')) {
        return null; // Admin
    }

    return errorResponse('Access denied. You can only access your own resources.', 403);
}

/**
 * Check if user created the resource or has admin role
 */
export function requireCreatorOrAdmin(user, resourceCreatorId) {
    return requireOwnerOrAdmin(user, resourceCreatorId);
}
