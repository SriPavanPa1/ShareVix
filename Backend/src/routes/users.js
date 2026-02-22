import { errorResponse, successResponse } from '../utils/response.js';
import { requireAdmin, requireOwnerOrAdmin } from '../middleware/roles.js';

/**
 * GET /api/users
 * List all users (admin only)
 */
export async function getAllUsers(request, env, supabase, user) {
    // Admin check
    const adminError = requireAdmin(user);
    if (adminError) return adminError;

    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '10');
    const search = url.searchParams.get('search') || '';

    let query = supabase
        .from('users')
        .select('id, name, email, mobile, age, is_active, created_at', { count: 'exact' });

    if (search) {
        query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%`);
    }

    const { data, error, count } = await query
        .range((page - 1) * limit, page * limit - 1)
        .order('created_at', { ascending: false });

    if (error) return errorResponse(error.message);

    return successResponse({
        users: data,
        pagination: {
            page,
            limit,
            total: count,
            totalPages: Math.ceil(count / limit)
        }
    });
}

/**
 * GET /api/users/:id
 * Get user by ID (owner or admin)
 */
export async function getUserById(request, env, supabase, user, userId) {
    // Owner or admin check
    const accessError = requireOwnerOrAdmin(user, userId);
    if (accessError) return accessError;

    const { data, error } = await supabase
        .from('users')
        .select('id, name, email, mobile, age, is_active, created_at, updated_at')
        .eq('id', userId)
        .single();

    if (error) return errorResponse('User not found', 404);

    // Get user roles
    const { data: roles } = await supabase
        .from('user_roles')
        .select('roles(role_name)')
        .eq('user_id', userId);

    return successResponse({
        user: data,
        roles: roles?.map(r => r.roles.role_name) || []
    });
}

/**
 * PUT /api/users/:id
 * Update user profile (owner or admin)
 */
export async function updateUser(request, env, supabase, user, userId) {
    // Owner or admin check
    const accessError = requireOwnerOrAdmin(user, userId);
    if (accessError) return accessError;

    const updates = await request.json();

    // Don't allow updating certain fields
    delete updates.id;
    delete updates.password_hash;
    delete updates.created_at;

    // Only admin can update is_active
    if (!user.roles.includes('admin')) {
        delete updates.is_active;
    }

    // Add updated_at timestamp
    updates.updated_at = new Date().toISOString();

    const { data, error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', userId)
        .select('id, name, email, mobile, age, is_active, updated_at')
        .single();

    if (error) return errorResponse(error.message);
    return successResponse(data, 'User updated');
}

/**
 * DELETE /api/users/:id
 * Soft delete user (admin only)
 */
export async function deleteUser(request, env, supabase, user, userId) {
    // Admin check
    const adminError = requireAdmin(user);
    if (adminError) return adminError;

    // Prevent self-deletion
    if (user.userId === userId) {
        return errorResponse('Cannot delete your own account', 400);
    }

    // Soft delete by setting is_active to false
    const { error } = await supabase
        .from('users')
        .update({ is_active: false, updated_at: new Date().toISOString() })
        .eq('id', userId);

    if (error) return errorResponse(error.message);
    return successResponse(null, 'User deactivated');
}

/**
 * POST /api/users/roles/assign
 * Assign role to user (admin only)
 */
export async function assignRole(request, env, supabase, user) {
    // Admin check
    const adminError = requireAdmin(user);
    if (adminError) return adminError;

    const { user_id, role_id } = await request.json();

    if (!user_id || !role_id) {
        return errorResponse('user_id and role_id are required', 400);
    }

    // Check if role already assigned
    const { data: existing } = await supabase
        .from('user_roles')
        .select('*')
        .eq('user_id', user_id)
        .eq('role_id', role_id)
        .single();

    if (existing) {
        return errorResponse('Role already assigned', 409);
    }

    const { error } = await supabase
        .from('user_roles')
        .insert([{ user_id, role_id }]);

    if (error) return errorResponse(error.message);
    return successResponse(null, 'Role assigned');
}

/**
 * POST /api/users/roles/remove
 * Remove role from user (admin only)
 */
export async function removeRole(request, env, supabase, user) {
    // Admin check
    const adminError = requireAdmin(user);
    if (adminError) return adminError;

    const { user_id, role_id } = await request.json();

    if (!user_id || !role_id) {
        return errorResponse('user_id and role_id are required', 400);
    }

    const { error } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', user_id)
        .eq('role_id', role_id);

    if (error) return errorResponse(error.message);
    return successResponse(null, 'Role removed');
}

/**
 * GET /api/roles
 * List all available roles (admin only)
 */
export async function getAllRoles(request, env, supabase, user) {
    // Admin check
    const adminError = requireAdmin(user);
    if (adminError) return adminError;

    const { data, error } = await supabase
        .from('roles')
        .select('*')
        .order('id');

    if (error) return errorResponse(error.message);
    return successResponse(data);
}
