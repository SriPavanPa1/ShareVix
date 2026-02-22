import { errorResponse, successResponse } from '../utils/response.js';
import { requireAdminOrAuthor, requireCreatorOrAdmin, requireAdmin } from '../middleware/roles.js';
import { uploadToImageKit } from '../utils/imagekit.js';

/**
 * GET /api/blogs
 * List published blogs (public)
 */
export async function getAllBlogs(request, env, supabase) {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '10');
    const search = url.searchParams.get('search') || '';
    const category = url.searchParams.get('category') || '';

    let query = supabase
        .from('blogs')
        .select('*, users!author_id(name)', { count: 'exact' })
        .eq('is_published', true);

    if (search) {
        query = query.or(`title.ilike.%${search}%,content.ilike.%${search}%,description.ilike.%${search}%`);
    }

    if (category) {
        query = query.eq('category', category);
    }

    const { data, error, count } = await query
        .range((page - 1) * limit, page * limit - 1)
        .order('created_at', { ascending: false });

    if (error) return errorResponse(error.message);

    // Get media assets for each blog
    const blogIds = data.map(b => b.id);
    const { data: mediaAssets } = await supabase
        .from('media_assets')
        .select('*')
        .eq('owner_type', 'blog')
        .in('owner_id', blogIds);

    // Attach media to blogs
    const blogsWithMedia = data.map(blog => ({
        ...blog,
        media: mediaAssets?.filter(m => m.owner_id === blog.id) || []
    }));

    return successResponse({
        blogs: blogsWithMedia,
        pagination: {
            page,
            limit,
            total: count,
            totalPages: Math.ceil(count / limit)
        }
    });
}

/**
 * GET /api/admin/blogs
 * List ALL blogs for admin (published + drafts)
 */
export async function getAllBlogsAdmin(request, env, supabase, user) {
    const roleError = requireAdmin(user);
    if (roleError) return roleError;

    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '50');
    const search = url.searchParams.get('search') || '';
    const category = url.searchParams.get('category') || '';
    const status = url.searchParams.get('status') || ''; // 'published' or 'draft'

    let query = supabase
        .from('blogs')
        .select('*, users!author_id(name)', { count: 'exact' });

    if (search) {
        query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
    }

    if (category) {
        query = query.eq('category', category);
    }

    if (status === 'published') {
        query = query.eq('is_published', true);
    } else if (status === 'draft') {
        query = query.eq('is_published', false);
    }

    const { data, error, count } = await query
        .range((page - 1) * limit, page * limit - 1)
        .order('created_at', { ascending: false });

    if (error) return errorResponse(error.message);

    // Get media assets
    const blogIds = data.map(b => b.id);
    let mediaAssets = [];
    if (blogIds.length > 0) {
        const { data: media } = await supabase
            .from('media_assets')
            .select('*')
            .eq('owner_type', 'blog')
            .in('owner_id', blogIds);
        mediaAssets = media || [];
    }

    const blogsWithMedia = data.map(blog => ({
        ...blog,
        author_name: blog.users?.name || 'Unknown',
        media: mediaAssets.filter(m => m.owner_id === blog.id)
    }));

    return successResponse({
        blogs: blogsWithMedia,
        pagination: { page, limit, total: count, totalPages: Math.ceil(count / limit) }
    });
}

/**
 * GET /api/blogs/:id
 * Get blog by ID with media (public for published)
 */
export async function getBlogById(request, env, supabase, blogId, user = null) {
    const { data, error } = await supabase
        .from('blogs')
        .select('*, users!author_id(name)')
        .eq('id', blogId)
        .single();

    if (error) return errorResponse('Blog not found', 404);

    // Check access for unpublished blogs
    if (!data.is_published) {
        if (!user) {
            return errorResponse('Blog not found', 404);
        }
        // Only author or admin can view unpublished
        if (user.userId !== data.author_id && !user.roles.includes('admin')) {
            return errorResponse('Blog not found', 404);
        }
    }

    // Get media assets
    const { data: media } = await supabase
        .from('media_assets')
        .select('*')
        .eq('owner_type', 'blog')
        .eq('owner_id', blogId);

    return successResponse({
        ...data,
        media: media || []
    });
}

/**
 * POST /api/blogs
 * Create new blog (admin/author only) - JSON body
 */
export async function createBlog(request, env, supabase, user) {
    const roleError = requireAdminOrAuthor(user);
    if (roleError) return roleError;

    const { title, content, is_published = false, category, description, tags, featured_image_url } = await request.json();

    if (!title || !content) {
        return errorResponse('Title and content are required', 400);
    }

    const { data, error } = await supabase
        .from('blogs')
        .insert([{
            title,
            content,
            author_id: user.userId,
            is_published,
            category: category || null,
            description: description || null,
            tags: tags || [],
            featured_image_url: featured_image_url || null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        }])
        .select()
        .single();

    if (error) return errorResponse(error.message);
    return successResponse(data, 'Blog created', 201);
}

/**
 * POST /api/blogs/with-media
 * Create blog with file uploads (multipart form-data)
 */
export async function createBlogWithMedia(request, env, supabase, user) {
    const roleError = requireAdminOrAuthor(user);
    if (roleError) return roleError;

    try {
        const formData = await request.formData();

        const title = formData.get('title');
        const content = formData.get('content') || '';
        const isPublished = formData.get('is_published') === 'true';
        const isPrivate = formData.get('is_private') === 'true';
        const category = formData.get('category') || null;
        const description = formData.get('description') || null;
        const tagsStr = formData.get('tags') || '';
        const tags = tagsStr ? tagsStr.split(',').map(t => t.trim()).filter(Boolean) : [];

        if (!title || !content) {
            return errorResponse('Title and content are required', 400);
        }

        // Handle featured image upload first
        let featuredImageUrl = null;
        const featuredImage = formData.get('featured_image');
        if (featuredImage && featuredImage.name) {
            try {
                const result = await uploadToImageKit(env, featuredImage, featuredImage.name, '/blogs/featured');
                featuredImageUrl = result.url;
            } catch (err) {
                console.error('Featured image upload error:', err);
            }
        }

        // Create blog
        const { data: blog, error: blogError } = await supabase
            .from('blogs')
            .insert([{
                title,
                content,
                author_id: user.userId,
                is_published: isPublished,
                category,
                description,
                tags,
                featured_image_url: featuredImageUrl,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            }])
            .select()
            .single();

        if (blogError) return errorResponse(blogError.message);

        // Handle additional file uploads
        const files = formData.getAll('files');
        const uploadedMedia = [];

        for (const file of files) {
            if (!file || !file.name) continue;

            try {
                const mimeType = file.type || '';
                let assetType = 'document';
                if (mimeType.startsWith('image/')) assetType = 'image';
                else if (mimeType.startsWith('video/')) assetType = 'video';

                const folder = isPrivate ? '/private/blogs' : '/blogs';
                const result = await uploadToImageKit(env, file, file.name, folder);

                const { data: mediaAsset, error: mediaError } = await supabase
                    .from('media_assets')
                    .insert([{
                        file_key: result.fileId,
                        url: result.url,
                        owner_type: 'blog',
                        owner_id: blog.id,
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
            blog,
            media: uploadedMedia
        }, 'Blog created with media', 201);

    } catch (error) {
        console.error('Create blog with media error:', error);
        return errorResponse(`Failed to create blog: ${error.message}`, 500);
    }
}

/**
 * POST /api/blogs/:id/media
 * Upload media to existing blog (multipart form-data)
 */
export async function uploadBlogMedia(request, env, supabase, user, blogId) {
    const { data: blog } = await supabase
        .from('blogs')
        .select('author_id')
        .eq('id', blogId)
        .single();

    if (!blog) {
        return errorResponse('Blog not found', 404);
    }

    const accessError = requireCreatorOrAdmin(user, blog.author_id);
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

                const folder = isPrivate ? '/private/blogs' : '/blogs';
                const result = await uploadToImageKit(env, file, file.name, folder);

                const { data: mediaAsset, error: mediaError } = await supabase
                    .from('media_assets')
                    .insert([{
                        file_key: result.fileId,
                        url: result.url,
                        owner_type: 'blog',
                        owner_id: blogId,
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
        console.error('Upload blog media error:', error);
        return errorResponse(`Upload failed: ${error.message}`, 500);
    }
}

/**
 * PUT /api/blogs/:id
 * Update blog (admin or blog author) - JSON body
 */
export async function updateBlog(request, env, supabase, user, blogId) {
    const { data: blog } = await supabase
        .from('blogs')
        .select('author_id')
        .eq('id', blogId)
        .single();

    if (!blog) {
        return errorResponse('Blog not found', 404);
    }

    const accessError = requireCreatorOrAdmin(user, blog.author_id);
    if (accessError) return accessError;

    const updates = await request.json();
    updates.updated_at = new Date().toISOString();

    const { data, error } = await supabase
        .from('blogs')
        .update(updates)
        .eq('id', blogId)
        .select()
        .single();

    if (error) return errorResponse(error.message);
    return successResponse(data, 'Blog updated');
}

/**
 * PUT /api/blogs/:id/with-media
 * Update blog with file uploads (multipart form-data)
 */
export async function updateBlogWithMedia(request, env, supabase, user, blogId) {
    const { data: blog } = await supabase
        .from('blogs')
        .select('author_id, featured_image_url')
        .eq('id', blogId)
        .single();

    if (!blog) {
        return errorResponse('Blog not found', 404);
    }

    const accessError = requireCreatorOrAdmin(user, blog.author_id);
    if (accessError) return accessError;

    try {
        const formData = await request.formData();

        const title = formData.get('title');
        const content = formData.get('content');
        const isPublished = formData.get('is_published');
        const category = formData.get('category');
        const description = formData.get('description');
        const tagsStr = formData.get('tags');
        const removeFeaturedImage = formData.get('remove_featured_image') === 'true';

        // Build update object with only provided fields
        const updates = { updated_at: new Date().toISOString() };
        if (title !== null) updates.title = title;
        if (content !== null) updates.content = content;
        if (isPublished !== null) updates.is_published = isPublished === 'true';
        if (category !== null) updates.category = category || null;
        if (description !== null) updates.description = description || null;
        if (tagsStr !== null) {
            updates.tags = tagsStr ? tagsStr.split(',').map(t => t.trim()).filter(Boolean) : [];
        }

        // Handle featured image
        let featuredImageUrl = blog.featured_image_url;
        const featuredImage = formData.get('featured_image');

        if (removeFeaturedImage) {
            featuredImageUrl = null;
        }

        if (featuredImage && featuredImage.name) {
            try {
                const result = await uploadToImageKit(env, featuredImage, featuredImage.name, '/blogs/featured');
                featuredImageUrl = result.url;
            } catch (err) {
                console.error('Featured image upload error:', err);
                return errorResponse('Failed to upload featured image', 500);
            }
        }

        updates.featured_image_url = featuredImageUrl;

        // Update blog
        const { data: updatedBlog, error: blogError } = await supabase
            .from('blogs')
            .update(updates)
            .eq('id', blogId)
            .select()
            .single();

        if (blogError) return errorResponse(blogError.message);

        // Get media assets for response
        const { data: media } = await supabase
            .from('media_assets')
            .select('*')
            .eq('owner_type', 'blog')
            .eq('owner_id', blogId);

        return successResponse({
            ...updatedBlog,
            media: media || []
        }, 'Blog updated');

    } catch (error) {
        console.error('Update blog with media error:', error);
        return errorResponse(`Failed to update blog: ${error.message}`, 500);
    }
}

/**
 * DELETE /api/blogs/:id
 * Delete blog (admin or blog author)
 */
export async function deleteBlog(request, env, supabase, user, blogId) {
    const { data: blog } = await supabase
        .from('blogs')
        .select('author_id')
        .eq('id', blogId)
        .single();

    if (!blog) {
        return errorResponse('Blog not found', 404);
    }

    const accessError = requireCreatorOrAdmin(user, blog.author_id);
    if (accessError) return accessError;

    const { error } = await supabase
        .from('blogs')
        .delete()
        .eq('id', blogId);

    if (error) return errorResponse(error.message);
    return successResponse(null, 'Blog deleted');
}

/**
 * GET /api/blogs/my
 * Get current user's blogs (including drafts)
 */
export async function getMyBlogs(request, env, supabase, user) {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '10');

    const { data, error, count } = await supabase
        .from('blogs')
        .select('*', { count: 'exact' })
        .eq('author_id', user.userId)
        .range((page - 1) * limit, page * limit - 1)
        .order('created_at', { ascending: false });

    if (error) return errorResponse(error.message);

    return successResponse({
        blogs: data,
        pagination: {
            page,
            limit,
            total: count,
            totalPages: Math.ceil(count / limit)
        }
    });
}
