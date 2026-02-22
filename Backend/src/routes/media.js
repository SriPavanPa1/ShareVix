import { errorResponse, successResponse } from '../utils/response.js';
import { getImageKitAuth, uploadToImageKit, deleteFromImageKit } from '../utils/imagekit.js';

/**
 * GET /api/media/auth
 * Get ImageKit authentication parameters for client-side upload
 */
export async function getAuthParams(request, env, supabase, user) {
    try {
        const authParams = await getImageKitAuth(env);
        return successResponse(authParams);
    } catch (error) {
        console.error('ImageKit auth error:', error);
        return errorResponse(error.message, 500);
    }
}

/**
 * POST /api/media
 * Register uploaded media asset in database
 * Called after successful ImageKit upload
 */
export async function registerMedia(request, env, supabase, user) {
    try {
        const { file_key, owner_type, owner_id, asset_type, is_private = false, url } = await request.json();

        // Validate required fields
        if (!file_key || !owner_type || !owner_id || !asset_type) {
            return errorResponse('file_key, owner_type, owner_id, and asset_type are required', 400);
        }

        // Validate owner_type
        if (!['course', 'blog'].includes(owner_type)) {
            return errorResponse('owner_type must be "course" or "blog"', 400);
        }

        // Validate asset_type
        if (!['image', 'video', 'document'].includes(asset_type)) {
            return errorResponse('asset_type must be "image", "video", or "document"', 400);
        }

        // Verify ownership of the resource
        const table = owner_type === 'course' ? 'courses' : 'blogs';
        const ownerField = owner_type === 'course' ? 'created_by' : 'author_id';

        const { data: resource } = await supabase
            .from(table)
            .select(ownerField)
            .eq('id', owner_id)
            .single();

        if (!resource) {
            return errorResponse(`${owner_type} not found`, 404);
        }

        // Check if user owns the resource or is admin
        if (resource[ownerField] !== user.userId && !user.roles.includes('admin')) {
            return errorResponse('Access denied', 403);
        }

        // Insert media asset
        const { data, error } = await supabase
            .from('media_assets')
            .insert([{
                file_key,
                owner_type,
                owner_id,
                asset_type,
                is_private,
                created_at: new Date().toISOString()
            }])
            .select()
            .single();

        if (error) return errorResponse(error.message);
        return successResponse(data, 'Media registered', 201);

    } catch (error) {
        console.error('Register media error:', error);
        return errorResponse('Failed to register media', 500);
    }
}

/**
 * POST /api/media/upload
 * Server-side upload to ImageKit (fallback)
 */
export async function uploadMedia(request, env, supabase, user) {
    try {
        const contentType = request.headers.get('Content-Type') || '';

        if (!contentType.includes('multipart/form-data')) {
            return errorResponse('Content-Type must be multipart/form-data', 400);
        }

        const formData = await request.formData();
        const file = formData.get('file');
        const ownerType = formData.get('owner_type');
        const ownerId = formData.get('owner_id');
        const assetType = formData.get('asset_type') || 'image';
        const isPrivate = formData.get('is_private') === 'true';

        if (!file) {
            return errorResponse('File is required', 400);
        }

        if (!ownerType || !ownerId) {
            return errorResponse('owner_type and owner_id are required', 400);
        }

        // Verify ownership
        const table = ownerType === 'course' ? 'courses' : 'blogs';
        const ownerField = ownerType === 'course' ? 'created_by' : 'author_id';

        const { data: resource } = await supabase
            .from(table)
            .select(ownerField)
            .eq('id', ownerId)
            .single();

        if (!resource || (resource[ownerField] !== user.userId && !user.roles.includes('admin'))) {
            return errorResponse('Access denied', 403);
        }

        // Upload to ImageKit
        const folder = isPrivate ? '/private' : `/${ownerType}s`;
        const result = await uploadToImageKit(env, file, file.name, folder);

        // Register in database
        const { data, error } = await supabase
            .from('media_assets')
            .insert([{
                file_key: result.fileId,
                owner_type: ownerType,
                owner_id: ownerId,
                asset_type: assetType,
                is_private: isPrivate,
                created_at: new Date().toISOString()
            }])
            .select()
            .single();

        if (error) {
            // Try to delete from ImageKit if DB insert fails
            await deleteFromImageKit(env, result.fileId);
            return errorResponse(error.message);
        }

        return successResponse({
            ...data,
            url: result.url,
            thumbnail_url: result.thumbnailUrl
        }, 'Media uploaded', 201);

    } catch (error) {
        console.error('Upload media error:', error);
        return errorResponse(`Upload failed: ${error.message}`, 500);
    }
}

/**
 * GET /api/media
 * List media assets for a resource
 */
export async function listMedia(request, env, supabase, user) {
    const url = new URL(request.url);
    const ownerType = url.searchParams.get('owner_type');
    const ownerId = url.searchParams.get('owner_id');

    if (!ownerType || !ownerId) {
        return errorResponse('owner_type and owner_id are required', 400);
    }

    let query = supabase
        .from('media_assets')
        .select('*')
        .eq('owner_type', ownerType)
        .eq('owner_id', ownerId);

    // Non-admin users can only see non-private assets unless they own the resource
    const table = ownerType === 'course' ? 'courses' : 'blogs';
    const ownerField = ownerType === 'course' ? 'created_by' : 'author_id';

    const { data: resource } = await supabase
        .from(table)
        .select(ownerField)
        .eq('id', ownerId)
        .single();

    if (resource && resource[ownerField] !== user.userId && !user.roles.includes('admin')) {
        query = query.eq('is_private', false);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) return errorResponse(error.message);
    return successResponse(data);
}

/**
 * DELETE /api/media/:id
 * Delete media asset
 */
export async function deleteMedia(request, env, supabase, user, mediaId) {
    // Get media asset
    const { data: media, error: fetchError } = await supabase
        .from('media_assets')
        .select('*')
        .eq('id', mediaId)
        .single();

    if (fetchError || !media) {
        return errorResponse('Media not found', 404);
    }

    // Check ownership
    const table = media.owner_type === 'course' ? 'courses' : 'blogs';
    const ownerField = media.owner_type === 'course' ? 'created_by' : 'author_id';

    const { data: resource } = await supabase
        .from(table)
        .select(ownerField)
        .eq('id', media.owner_id)
        .single();

    if (resource && resource[ownerField] !== user.userId && !user.roles.includes('admin')) {
        return errorResponse('Access denied', 403);
    }

    // Delete from ImageKit
    try {
        await deleteFromImageKit(env, media.file_key);
    } catch (error) {
        console.error('ImageKit delete error:', error);
        // Continue with DB deletion even if ImageKit fails
    }

    // Delete from database
    const { error } = await supabase
        .from('media_assets')
        .delete()
        .eq('id', mediaId);

    if (error) return errorResponse(error.message);
    return successResponse(null, 'Media deleted');
}
