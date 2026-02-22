import { errorResponse, successResponse } from '../utils/response.js';
import { requireAdmin, requireOwnerOrAdmin } from '../middleware/roles.js';

/**
 * POST /api/payments
 * Create payment record
 */
export async function createPayment(request, env, supabase, user) {
    try {
        const { course_id, amount, payment_gateway, transaction_id } = await request.json();

        if (!course_id || !amount) {
            return errorResponse('course_id and amount are required', 400);
        }

        // Verify course exists
        const { data: course, error: courseError } = await supabase
            .from('courses')
            .select('id, price')
            .eq('id', course_id)
            .eq('is_active', true)
            .single();

        if (courseError || !course) {
            return errorResponse('Course not found', 404);
        }

        // Create payment record
        const { data, error } = await supabase
            .from('payments')
            .insert([{
                user_id: user.userId,
                course_id,
                amount: parseFloat(amount),
                payment_gateway: payment_gateway || 'manual',
                transaction_id,
                payment_status: 'pending',
                paid_at: new Date().toISOString()
            }])
            .select()
            .single();

        if (error) {
            if (error.code === '23505') {
                return errorResponse('Duplicate transaction ID', 409);
            }
            return errorResponse(error.message);
        }

        return successResponse(data, 'Payment created', 201);

    } catch (error) {
        console.error('Create payment error:', error);
        return errorResponse('Failed to create payment', 500);
    }
}

/**
 * GET /api/payments/:id
 * Get payment details
 */
export async function getPaymentById(request, env, supabase, user, paymentId) {
    const { data, error } = await supabase
        .from('payments')
        .select('*, courses(title), users!user_id(name, email)')
        .eq('id', paymentId)
        .single();

    if (error || !data) {
        return errorResponse('Payment not found', 404);
    }

    // Check access
    const accessError = requireOwnerOrAdmin(user, data.user_id);
    if (accessError) return accessError;

    return successResponse(data);
}

/**
 * PUT /api/payments/:id
 * Update payment status (admin only)
 */
export async function updatePaymentStatus(request, env, supabase, user, paymentId) {
    // Admin check
    const adminError = requireAdmin(user);
    if (adminError) return adminError;

    const { payment_status } = await request.json();

    if (!payment_status) {
        return errorResponse('payment_status is required', 400);
    }

    // Validate status
    const validStatuses = ['pending', 'completed', 'failed', 'refunded'];
    if (!validStatuses.includes(payment_status)) {
        return errorResponse(`Invalid status. Must be one of: ${validStatuses.join(', ')}`, 400);
    }

    // Get current payment
    const { data: payment } = await supabase
        .from('payments')
        .select('*')
        .eq('id', paymentId)
        .single();

    if (!payment) {
        return errorResponse('Payment not found', 404);
    }

    // Update payment
    const { data, error } = await supabase
        .from('payments')
        .update({ payment_status })
        .eq('id', paymentId)
        .select()
        .single();

    if (error) return errorResponse(error.message);

    // If payment completed, enroll user in course
    if (payment_status === 'completed' && payment.payment_status !== 'completed') {
        const { error: enrollError } = await supabase
            .from('user_courses')
            .upsert([{
                user_id: payment.user_id,
                course_id: payment.course_id,
                purchase_date: new Date().toISOString(),
                is_active: true
            }], {
                onConflict: 'user_id,course_id'
            });

        if (enrollError) {
            console.error('Enrollment error:', enrollError);
        }
    }

    return successResponse(data, 'Payment status updated');
}

/**
 * GET /api/users/:id/payments
 * Get user's payment history
 */
export async function getUserPayments(request, env, supabase, user, userId) {
    // Check access
    const accessError = requireOwnerOrAdmin(user, userId);
    if (accessError) return accessError;

    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '10');

    const { data, error, count } = await supabase
        .from('payments')
        .select('*, courses(title)', { count: 'exact' })
        .eq('user_id', userId)
        .range((page - 1) * limit, page * limit - 1)
        .order('paid_at', { ascending: false });

    if (error) return errorResponse(error.message);

    return successResponse({
        payments: data,
        pagination: {
            page,
            limit,
            total: count,
            totalPages: Math.ceil(count / limit)
        }
    });
}

/**
 * GET /api/payments
 * List all payments (admin only)
 */
export async function getAllPayments(request, env, supabase, user) {
    // Admin check
    const adminError = requireAdmin(user);
    if (adminError) return adminError;

    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '10');
    const status = url.searchParams.get('status');

    let query = supabase
        .from('payments')
        .select('*, courses(title), users!user_id(name, email)', { count: 'exact' });

    if (status) {
        query = query.eq('payment_status', status);
    }

    const { data, error, count } = await query
        .range((page - 1) * limit, page * limit - 1)
        .order('paid_at', { ascending: false });

    if (error) return errorResponse(error.message);

    return successResponse({
        payments: data,
        pagination: {
            page,
            limit,
            total: count,
            totalPages: Math.ceil(count / limit)
        }
    });
}
