import { verifyToken, getUserRoles } from '../utils/auth.js';
import { errorResponse } from '../utils/response.js';

/**
 * Authenticate request and attach user to context
 * Returns { user } on success or { error: Response } on failure
 */
export async function authenticate(request, env, supabase) {
    const authHeader = request.headers.get('Authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return { error: errorResponse('Authorization token required', 401) };
    }

    const token = authHeader.substring(7);

    if (!env.JWT_SECRET) {
        console.error('JWT_SECRET not configured');
        return { error: errorResponse('Server configuration error', 500) };
    }

    const decoded = await verifyToken(token, env.JWT_SECRET);

    if (!decoded) {
        return { error: errorResponse('Invalid or expired token', 401) };
    }

    // Fetch user roles
    const roles = await getUserRoles(supabase, decoded.userId);

    // Verify user still exists and is active
    const { data: user, error } = await supabase
        .from('users')
        .select('id, name, email, is_active')
        .eq('id', decoded.userId)
        .single();

    if (error || !user) {
        return { error: errorResponse('User not found', 401) };
    }

    if (!user.is_active) {
        return { error: errorResponse('Account is inactive', 403) };
    }

    return {
        user: {
            ...decoded,
            roles,
            name: user.name
        }
    };
}

/**
 * Optional authentication - doesn't fail if no token provided
 * Returns user if authenticated, null otherwise
 */
export async function optionalAuth(request, env, supabase) {
    const authHeader = request.headers.get('Authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return { user: null };
    }

    return authenticate(request, env, supabase);
}
