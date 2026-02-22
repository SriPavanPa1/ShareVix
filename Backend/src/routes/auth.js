import { hashPassword, comparePassword, generateToken, getUserRoles } from '../utils/auth.js';
import { errorResponse, successResponse } from '../utils/response.js';

/**
 * POST /api/auth/register
 * Create a new user account
 */
export async function register(request, env, supabase) {
    try {
        const { name, email, password, mobile, age } = await request.json();

        // Validation
        if (!name || !email || !password) {
            return errorResponse('Name, email, and password are required', 400);
        }

        if (!email.includes('@')) {
            return errorResponse('Invalid email format', 400);
        }

        if (password.length < 8) {
            return errorResponse('Password must be at least 8 characters', 400);
        }

        if (mobile && mobile.length < 10) {
            return errorResponse('Invalid mobile number', 400);
        }

        // Hash password
        const hashedPassword = await hashPassword(password);

        // Create user
        const { data, error } = await supabase
            .from('users')
            .insert([{
                name,
                email,
                mobile: mobile || null,
                age: age ? parseInt(age) : null,
                password_hash: hashedPassword,
                is_active: true
            }])
            .select('id, name, email, mobile, age, is_active, created_at')
            .single();

        if (error) {
            console.error('Registration error:', error);
            if (error.code === '23505') {
                if (error.message.includes('email')) {
                    return errorResponse('Email already exists', 409);
                }
                if (error.message.includes('mobile')) {
                    return errorResponse('Mobile number already exists', 409);
                }
                return errorResponse('User already exists', 409);
            }
            return errorResponse(error.message, 400);
        }

        // Assign default 'student' role (role_id = 2)
        const { error: roleError } = await supabase
            .from('user_roles')
            .insert([{ user_id: data.id, role_id: 2 }]);

        if (roleError) {
            console.error('Role assignment error:', roleError);
            // Continue even if role assignment fails
        }

        // Generate token
        if (!env.JWT_SECRET) {
            console.error('JWT_SECRET not configured');
            return errorResponse('Server configuration error', 500);
        }

        const token = await generateToken(data, env.JWT_SECRET);

        return successResponse({
            user: data,
            roles: ['student'],
            token
        }, 'Registration successful', 201);

    } catch (error) {
        console.error('Registration error:', error);
        return errorResponse(`Registration failed: ${error.message}`, 500);
    }
}

/**
 * POST /api/auth/login
 * Authenticate user and return token
 */
export async function login(request, env, supabase) {
    try {
        const { email, password } = await request.json();

        if (!email || !password) {
            return errorResponse('Email and password are required', 400);
        }

        // Find user
        const { data: user, error } = await supabase
            .from('users')
            .select('*')
            .eq('email', email)
            .single();

        if (error || !user) {
            return errorResponse('Invalid credentials', 401);
        }

        // Check if active
        if (!user.is_active) {
            return errorResponse('Account is inactive. Please contact support.', 403);
        }

        // Verify password
        const isValid = await comparePassword(password, user.password_hash);

        if (!isValid) {
            return errorResponse('Invalid credentials', 401);
        }

        // Get roles
        const roles = await getUserRoles(supabase, user.id);

        // Generate token
        if (!env.JWT_SECRET) {
            console.error('JWT_SECRET not configured');
            return errorResponse('Server configuration error', 500);
        }

        const token = await generateToken(user, env.JWT_SECRET);

        return successResponse({
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                mobile: user.mobile,
                age: user.age,
                is_active: user.is_active
            },
            roles,
            token
        }, 'Login successful');

    } catch (error) {
        console.error('Login error:', error);
        return errorResponse(`Login failed: ${error.message}`, 500);
    }
}

/**
 * POST /api/auth/forgot-password
 * Initiate password reset (placeholder - needs email service)
 */
export async function forgotPassword(request, env, supabase) {
    try {
        const { email } = await request.json();

        if (!email) {
            return errorResponse('Email is required', 400);
        }

        // Check if user exists
        const { data: user, error } = await supabase
            .from('users')
            .select('id, email, name')
            .eq('email', email)
            .single();

        if (error || !user) {
            // Don't reveal if email exists or not (security)
            return successResponse(null, 'If the email exists, a reset link will be sent');
        }

        // TODO: Implement email sending
        // For now, just return success message
        // In production, you would:
        // 1. Generate a unique reset token
        // 2. Store token with expiry in database
        // 3. Send email with reset link

        console.log(`Password reset requested for: ${email}`);

        return successResponse(null, 'If the email exists, a reset link will be sent');

    } catch (error) {
        console.error('Forgot password error:', error);
        return errorResponse('Failed to process request', 500);
    }
}

/**
 * GET /api/auth/me
 * Get current user profile with roles
 */
export async function getCurrentUser(request, env, supabase, user) {
    try {
        // Fetch full user details
        const { data, error } = await supabase
            .from('users')
            .select('id, name, email, mobile, age, is_active, created_at, updated_at')
            .eq('id', user.userId)
            .single();

        if (error) {
            return errorResponse('Failed to fetch user', 500);
        }

        return successResponse({
            user: data,
            roles: user.roles
        });

    } catch (error) {
        console.error('Get current user error:', error);
        return errorResponse('Failed to fetch user', 500);
    }
}
