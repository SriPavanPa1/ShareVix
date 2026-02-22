import { errorResponse, successResponse } from '../utils/response.js';
import { requireAdminOrInstructor, requireCreatorOrAdmin, requireAdmin } from '../middleware/roles.js';
import { uploadToImageKit, deleteFromImageKit } from '../utils/imagekit.js';

/**
 * GET /api/courses
 * List all active courses (public)
 */
export async function getAllCourses(request, env, supabase) {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '10');
    const search = url.searchParams.get('search') || '';
    const isPaid = url.searchParams.get('is_paid');
    const category = url.searchParams.get('category') || '';
    const level = url.searchParams.get('level') || '';

    let query = supabase
        .from('courses')
        .select('*, users!created_by(name)', { count: 'exact' })
        .eq('is_active', true);

    if (search) {
        query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%,instructor_name.ilike.%${search}%`);
    }

    if (isPaid === 'true') {
        query = query.eq('is_paid', true);
    } else if (isPaid === 'false') {
        query = query.eq('is_paid', false);
    }

    if (category) {
        query = query.eq('category', category);
    }

    if (level) {
        query = query.ilike('level', level);
    }

    const { data, error, count } = await query
        .range((page - 1) * limit, page * limit - 1)
        .order('created_at', { ascending: false });

    if (error) return errorResponse(error.message);

    // Get media assets for each course
    const courseIds = data.map(c => c.id);
    const { data: mediaAssets } = await supabase
        .from('media_assets')
        .select('*')
        .eq('owner_type', 'course')
        .in('owner_id', courseIds);

    // Attach media to courses
    const coursesWithMedia = data.map(course => ({
        ...course,
        media: mediaAssets?.filter(m => m.owner_id === course.id) || []
    }));

    return successResponse({
        courses: coursesWithMedia,
        pagination: {
            page,
            limit,
            total: count,
            totalPages: Math.ceil(count / limit)
        }
    });
}

/**
 * GET /api/admin/courses
 * List ALL courses for admin (active + inactive)
 */
export async function getAllCoursesAdmin(request, env, supabase, user) {
    const roleError = requireAdmin(user);
    if (roleError) return roleError;

    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '50');
    const search = url.searchParams.get('search') || '';
    const category = url.searchParams.get('category') || '';
    const level = url.searchParams.get('level') || '';
    const status = url.searchParams.get('status') || ''; // 'active' or 'inactive'

    let query = supabase
        .from('courses')
        .select('*, users!created_by(name)', { count: 'exact' });

    if (search) {
        query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%,instructor_name.ilike.%${search}%`);
    }

    if (category) {
        query = query.eq('category', category);
    }

    if (level) {
        query = query.ilike('level', level);
    }

    if (status === 'active') {
        query = query.eq('is_active', true);
    } else if (status === 'inactive') {
        query = query.eq('is_active', false);
    }

    const { data, error, count } = await query
        .range((page - 1) * limit, page * limit - 1)
        .order('created_at', { ascending: false });

    if (error) return errorResponse(error.message);

    // Get media assets
    const courseIds = data.map(c => c.id);
    let mediaAssets = [];
    if (courseIds.length > 0) {
        const { data: media } = await supabase
            .from('media_assets')
            .select('*')
            .eq('owner_type', 'course')
            .in('owner_id', courseIds);
        mediaAssets = media || [];
    }

    const coursesWithMedia = data.map(course => ({
        ...course,
        creator_name: course.users?.name || 'Unknown',
        media: mediaAssets.filter(m => m.owner_id === course.id)
    }));

    return successResponse({
        courses: coursesWithMedia,
        pagination: { page, limit, total: count, totalPages: Math.ceil(count / limit) }
    });
}

/**
 * GET /api/courses/:id
 * Get course by ID with media (public)
 */
export async function getCourseById(request, env, supabase, courseId) {
    const { data, error } = await supabase
        .from('courses')
        .select('*, users!created_by(name)')
        .eq('id', courseId)
        .single();

    if (error) return errorResponse('Course not found', 404);

    // Get media assets
    const { data: media } = await supabase
        .from('media_assets')
        .select('*')
        .eq('owner_type', 'course')
        .eq('owner_id', courseId)
        .eq('is_private', false);

    return successResponse({
        ...data,
        media: media || []
    });
}

/**
 * POST /api/courses
 * Create new course (admin/instructor only) - JSON body
 */
export async function createCourse(request, env, supabase, user) {
    const roleError = requireAdminOrInstructor(user);
    if (roleError) return roleError;

    const { title, description, price, category, level, duration, instructor_name } = await request.json();

    if (!title) {
        return errorResponse('Title is required', 400);
    }

    const coursePrice = parseFloat(price) || 0;

    const { data, error } = await supabase
        .from('courses')
        .insert([{
            title,
            description,
            price: coursePrice,
            created_by: user.userId,
            is_active: true,
            category: category || null,
            level: level || 'Beginner',
            duration: duration || null,
            instructor_name: instructor_name || null
        }])
        .select()
        .single();

    if (error) return errorResponse(error.message);
    return successResponse(data, 'Course created', 201);
}

/**
 * POST /api/courses/with-media
 * Create course with file uploads (multipart form-data)
 */
export async function createCourseWithMedia(request, env, supabase, user) {
    const roleError = requireAdminOrInstructor(user);
    if (roleError) return roleError;

    try {
        const formData = await request.formData();

        const title = formData.get('title');
        const description = formData.get('description') || '';
        const price = formData.get('price') || '0';
        const isPrivate = formData.get('is_private') === 'true';
        const category = formData.get('category') || null;
        const level = formData.get('level') || 'Beginner';
        const duration = formData.get('duration') || null;
        const instructorName = formData.get('instructor_name') || null;

        if (!title) {
            return errorResponse('Title is required', 400);
        }

        const coursePrice = parseFloat(price) || 0;

        // Create course first
        const { data: course, error: courseError } = await supabase
            .from('courses')
            .insert([{
                title,
                description,
                price: coursePrice,
                created_by: user.userId,
                is_active: true,
                category,
                level,
                duration,
                instructor_name: instructorName
            }])
            .select()
            .single();

        if (courseError) return errorResponse(courseError.message);

        // Handle file uploads
        const files = formData.getAll('files');
        const uploadedMedia = [];

        for (const file of files) {
            if (!file || !file.name) continue;

            try {
                const mimeType = file.type || '';
                let assetType = 'document';
                if (mimeType.startsWith('image/')) assetType = 'image';
                else if (mimeType.startsWith('video/')) assetType = 'video';

                const folder = isPrivate ? '/private/courses' : '/courses';
                const result = await uploadToImageKit(env, file, file.name, folder);

                const { data: mediaAsset, error: mediaError } = await supabase
                    .from('media_assets')
                    .insert([{
                        file_key: result.fileId,
                        url: result.url,
                        owner_type: 'course',
                        owner_id: course.id,
                        asset_type: assetType,
                        is_private: isPrivate,
                        created_at: new Date().toISOString()
                    }])
                    .select()
                    .single();

                if (!mediaError) {
                    uploadedMedia.push({
                        ...mediaAsset,
                        url: result.url,
                        thumbnail_url: result.thumbnailUrl
                    });
                }
            } catch (uploadError) {
                console.error('File upload error:', uploadError);
            }
        }

        return successResponse({
            course,
            media: uploadedMedia
        }, 'Course created with media', 201);

    } catch (error) {
        console.error('Create course with media error:', error);
        return errorResponse(`Failed to create course: ${error.message}`, 500);
    }
}

/**
 * POST /api/courses/:id/media
 * Upload media to existing course (multipart form-data)
 */
export async function uploadCourseMedia(request, env, supabase, user, courseId) {
    const { data: course } = await supabase
        .from('courses')
        .select('created_by')
        .eq('id', courseId)
        .single();

    if (!course) {
        return errorResponse('Course not found', 404);
    }

    const accessError = requireCreatorOrAdmin(user, course.created_by);
    if (accessError) return accessError;

    try {
        const formData = await request.formData();
        const files = formData.getAll('files');
        const isPrivate = formData.get('is_private') === 'true';

        if (!files || files.length === 0) {
            return errorResponse('No files provided', 400);
        }

        const uploadedMedia = [];

        for (const file of files) {
            if (!file || !file.name) continue;

            try {
                const mimeType = file.type || '';
                let assetType = 'document';
                if (mimeType.startsWith('image/')) assetType = 'image';
                else if (mimeType.startsWith('video/')) assetType = 'video';

                const folder = isPrivate ? '/private/courses' : '/courses';
                const result = await uploadToImageKit(env, file, file.name, folder);

                const { data: mediaAsset, error: mediaError } = await supabase
                    .from('media_assets')
                    .insert([{
                        file_key: result.fileId,
                        owner_type: 'course',
                        owner_id: courseId,
                        asset_type: assetType,
                        is_private: isPrivate,
                        created_at: new Date().toISOString()
                    }])
                    .select()
                    .single();

                if (!mediaError) {
                    uploadedMedia.push({
                        ...mediaAsset,
                        url: result.url,
                        thumbnail_url: result.thumbnailUrl
                    });
                }
            } catch (uploadError) {
                console.error('File upload error:', uploadError);
            }
        }

        return successResponse(uploadedMedia, `${uploadedMedia.length} file(s) uploaded`, 201);

    } catch (error) {
        console.error('Upload course media error:', error);
        return errorResponse(`Upload failed: ${error.message}`, 500);
    }
}

/**
 * PUT /api/courses/:id
 * Update course (admin or course creator) - JSON body
 */
export async function updateCourse(request, env, supabase, user, courseId) {
    const { data: course } = await supabase
        .from('courses')
        .select('created_by')
        .eq('id', courseId)
        .single();

    if (!course) {
        return errorResponse('Course not found', 404);
    }

    const accessError = requireCreatorOrAdmin(user, course.created_by);
    if (accessError) return accessError;

    const updates = await request.json();

    // Remove is_paid from updates if present (handled by DB)
    if (updates.is_paid !== undefined) {
        delete updates.is_paid;
    }

    const { data, error } = await supabase
        .from('courses')
        .update(updates)
        .eq('id', courseId)
        .select()
        .single();

    if (error) return errorResponse(error.message);
    return successResponse(data, 'Course updated');
}

/**
 * PUT /api/courses/:id/with-media
 * Update course with file uploads (multipart form-data)
 */
export async function updateCourseWithMedia(request, env, supabase, user, courseId) {
    const { data: course } = await supabase
        .from('courses')
        .select('created_by')
        .eq('id', courseId)
        .single();

    if (!course) {
        return errorResponse('Course not found', 404);
    }

    const accessError = requireCreatorOrAdmin(user, course.created_by);
    if (accessError) return accessError;

    try {
        const formData = await request.formData();

        const title = formData.get('title');
        const description = formData.get('description');
        const price = formData.get('price');
        const category = formData.get('category');
        const level = formData.get('level');
        const duration = formData.get('duration');
        const instructorName = formData.get('instructor_name');
        const isActive = formData.get('is_active');
        const removeMediaIdsStr = formData.get('remove_media_ids') || '';
        const removeMediaIds = removeMediaIdsStr ? removeMediaIdsStr.split(',').filter(Boolean) : [];

        // Build update object with only provided fields
        const updates = {};
        if (title !== null) updates.title = title;
        if (description !== null) updates.description = description;
        if (price !== null) updates.price = parseFloat(price) || 0;
        if (category !== null) updates.category = category || null;
        if (level !== null) updates.level = level || 'Beginner';
        if (duration !== null) updates.duration = duration || null;
        if (instructorName !== null) updates.instructor_name = instructorName || null;
        if (isActive !== null) updates.is_active = isActive === 'true';

        // Update course
        const { data: updatedCourse, error: courseError } = await supabase
            .from('courses')
            .update(updates)
            .eq('id', courseId)
            .select()
            .single();

        if (courseError) return errorResponse(courseError.message);

        // Handle deletions first
        if (removeMediaIds.length > 0) {
            // Get file keys for ImageKit cleanup
            const { data: mediaToDelete } = await supabase
                .from('media_assets')
                .select('file_key')
                .in('id', removeMediaIds)
                .eq('owner_id', courseId)
                .eq('owner_type', 'course');

            if (mediaToDelete && mediaToDelete.length > 0) {
                for (const m of mediaToDelete) {
                    if (m.file_key) {
                        await deleteFromImageKit(env, m.file_key).catch(e => console.error('ImageKit cleanup error:', e));
                    }
                }
            }

            await supabase
                .from('media_assets')
                .delete()
                .in('id', removeMediaIds)
                .eq('owner_id', courseId)
                .eq('owner_type', 'course');
        }

        // Handle file uploads (image, video, materials)
        const files = formData.getAll('files');
        const uploadedMedia = [];

        for (const file of files) {
            if (!file || !file.name) continue;

            try {
                const mimeType = file.type || '';
                let assetType = 'document';
                if (mimeType.startsWith('image/')) assetType = 'image';
                else if (mimeType.startsWith('video/')) assetType = 'video';

                // If adding a new image/video, replace existing ones
                if (assetType === 'image' || assetType === 'video') {
                    const { data: existing } = await supabase
                        .from('media_assets')
                        .select('file_key')
                        .eq('owner_id', courseId)
                        .eq('owner_type', 'course')
                        .eq('asset_type', assetType);

                    if (existing && existing.length > 0) {
                        for (const m of existing) {
                            if (m.file_key) {
                                await deleteFromImageKit(env, m.file_key).catch(e => console.error('ImageKit cleanup error:', e));
                            }
                        }
                    }

                    await supabase
                        .from('media_assets')
                        .delete()
                        .eq('owner_id', courseId)
                        .eq('owner_type', 'course')
                        .eq('asset_type', assetType);
                }

                const folder = '/courses';
                const result = await uploadToImageKit(env, file, file.name, folder);

                const { data: mediaAsset, error: mediaError } = await supabase
                    .from('media_assets')
                    .insert([{
                        file_key: result.fileId,
                        url: result.url,
                        owner_type: 'course',
                        owner_id: courseId,
                        asset_type: assetType,
                        is_private: false,
                        created_at: new Date().toISOString()
                    }])
                    .select()
                    .single();

                if (!mediaError) {
                    uploadedMedia.push({
                        ...mediaAsset,
                        url: result.url,
                        thumbnail_url: result.thumbnailUrl
                    });
                }
            } catch (uploadError) {
                console.error('File upload error:', uploadError);
            }
        }

        // Get all media assets for response
        const { data: media } = await supabase
            .from('media_assets')
            .select('*')
            .eq('owner_type', 'course')
            .eq('owner_id', courseId);

        return successResponse({
            ...updatedCourse,
            media: media || [],
            newUploads: uploadedMedia
        }, 'Course updated');

    } catch (error) {
        console.error('Update course with media error:', error);
        return errorResponse(`Failed to update course: ${error.message}`, 500);
    }
}

/**
 * DELETE /api/courses/:id
 * Delete course (admin or course creator) - soft delete
 */
export async function deleteCourse(request, env, supabase, user, courseId) {
    const { data: course } = await supabase
        .from('courses')
        .select('created_by')
        .eq('id', courseId)
        .single();

    if (!course) {
        return errorResponse('Course not found', 404);
    }

    const accessError = requireCreatorOrAdmin(user, course.created_by);
    if (accessError) return accessError;

    // Hard delete: Clean up from ImageKit first
    const { data: mediaAssets } = await supabase
        .from('media_assets')
        .select('file_key')
        .eq('owner_id', courseId)
        .eq('owner_type', 'course');

    if (mediaAssets && mediaAssets.length > 0) {
        for (const m of mediaAssets) {
            if (m.file_key) {
                await deleteFromImageKit(env, m.file_key).catch(e => console.error('ImageKit cleanup error:', e));
            }
        }
    }

    // Delete associated media records from DB
    await supabase
        .from('media_assets')
        .delete()
        .eq('owner_id', courseId)
        .eq('owner_type', 'course');

    // Hard delete the course
    const { error } = await supabase
        .from('courses')
        .delete()
        .eq('id', courseId);

    if (error) return errorResponse(error.message);
    return successResponse(null, 'Course and associated media permanently deleted');
}

/**
 * POST /api/courses/purchase
 * Purchase/enroll in a course (any authenticated user)
 */
export async function purchaseCourse(request, env, supabase, user) {
    const { course_id, access_expiry } = await request.json();

    if (!course_id) {
        return errorResponse('course_id is required', 400);
    }

    const { data: course, error: courseError } = await supabase
        .from('courses')
        .select('id, title, price, is_paid')
        .eq('id', course_id)
        .eq('is_active', true)
        .single();

    if (courseError || !course) {
        return errorResponse('Course not found', 404);
    }

    const { data: existing } = await supabase
        .from('user_courses')
        .select('id')
        .eq('user_id', user.userId)
        .eq('course_id', course_id)
        .single();

    if (existing) {
        return errorResponse('Course already purchased', 409);
    }

    const { data, error } = await supabase
        .from('user_courses')
        .insert([{
            user_id: user.userId,
            course_id,
            purchase_date: new Date().toISOString(),
            access_expiry: access_expiry || null,
            is_active: true
        }])
        .select()
        .single();

    if (error) return errorResponse(error.message);
    return successResponse({
        enrollment: data,
        course: { id: course.id, title: course.title }
    }, 'Course enrolled successfully');
}

/**
 * GET /api/users/:id/courses
 * Get user's enrolled courses
 */
export async function getUserCourses(request, env, supabase, user, userId) {
    if (user.userId !== userId && !user.roles.includes('admin')) {
        return errorResponse('Access denied', 403);
    }

    const { data, error } = await supabase
        .from('user_courses')
        .select('*, courses(*)')
        .eq('user_id', userId)
        .eq('is_active', true)
        .order('purchase_date', { ascending: false });

    if (error) return errorResponse(error.message);
    return successResponse(data);
}
