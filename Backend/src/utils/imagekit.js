/**
 * ImageKit utilities for media upload
 * Provides authentication for client-side uploads and server-side upload helpers
 */

/**
 * Generate authentication parameters for client-side ImageKit upload
 * Client uses these params to upload directly to ImageKit
 */
export function getAuthenticationParameters(env) {
    const privateKey = env.IMAGEKIT_PRIVATE_KEY;
    const publicKey = env.IMAGEKIT_PUBLIC_KEY;
    const urlEndpoint = env.IMAGEKIT_URL_ENDPOINT;

    if (!privateKey || !publicKey) {
        throw new Error('ImageKit credentials not configured');
    }

    const token = crypto.randomUUID();
    const expire = Math.floor(Date.now() / 1000) + 3600; // 1 hour from now

    // Generate signature: HMAC-SHA1(privateKey, token + expire)
    const signatureData = token + expire;

    return {
        token,
        expire,
        signature: null, // Will be computed async
        publicKey,
        urlEndpoint
    };
}

/**
 * Generate HMAC-SHA1 signature for ImageKit authentication
 */
export async function generateSignature(token, expire, privateKey) {
    const encoder = new TextEncoder();
    const signatureData = token + expire;

    const key = await crypto.subtle.importKey(
        'raw',
        encoder.encode(privateKey),
        { name: 'HMAC', hash: 'SHA-1' },
        false,
        ['sign']
    );

    const signature = await crypto.subtle.sign(
        'HMAC',
        key,
        encoder.encode(signatureData)
    );

    // Convert to hex string
    const hashArray = Array.from(new Uint8Array(signature));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Get full authentication params with signature
 */
export async function getImageKitAuth(env) {
    const privateKey = env.IMAGEKIT_PRIVATE_KEY;
    const publicKey = env.IMAGEKIT_PUBLIC_KEY;
    const urlEndpoint = env.IMAGEKIT_URL_ENDPOINT;

    if (!privateKey || !publicKey) {
        throw new Error('ImageKit credentials not configured');
    }

    const token = crypto.randomUUID();
    const expire = Math.floor(Date.now() / 1000) + 3600;
    const signature = await generateSignature(token, expire, privateKey);

    return {
        token,
        expire,
        signature,
        publicKey,
        urlEndpoint
    };
}

/**
 * Upload file to ImageKit (server-side)
 * Use for fallback when client-side upload fails
 */
export async function uploadToImageKit(env, fileData, fileName, folder = '/') {
    const privateKey = env.IMAGEKIT_PRIVATE_KEY;

    if (!privateKey) {
        throw new Error('ImageKit private key not configured');
    }

    const formData = new FormData();
    formData.append('file', fileData);
    formData.append('fileName', fileName);
    formData.append('folder', folder);
    formData.append('useUniqueFileName', 'true');

    const auth = btoa(`${privateKey}:`);

    const response = await fetch('https://upload.imagekit.io/api/v1/files/upload', {
        method: 'POST',
        headers: {
            'Authorization': `Basic ${auth}`
        },
        body: formData
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error(`ImageKit upload failed: ${error}`);
    }

    return await response.json();
}

/**
 * Delete file from ImageKit
 */
export async function deleteFromImageKit(env, fileId) {
    const privateKey = env.IMAGEKIT_PRIVATE_KEY;

    if (!privateKey) {
        throw new Error('ImageKit private key not configured');
    }

    const auth = btoa(`${privateKey}:`);

    const response = await fetch(`https://api.imagekit.io/v1/files/${fileId}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Basic ${auth}`
        }
    });

    if (!response.ok && response.status !== 404) {
        const error = await response.text();
        throw new Error(`ImageKit delete failed: ${error}`);
    }

    return true;
}

/**
 * Get ImageKit URL with transformations
 */
export function getTransformedUrl(urlEndpoint, filePath, transformations = {}) {
    let transformString = '';

    if (transformations.width) transformString += `w-${transformations.width},`;
    if (transformations.height) transformString += `h-${transformations.height},`;
    if (transformations.quality) transformString += `q-${transformations.quality},`;
    if (transformations.format) transformString += `f-${transformations.format},`;

    // Remove trailing comma
    if (transformString) {
        transformString = 'tr:' + transformString.slice(0, -1);
        return `${urlEndpoint}/${transformString}/${filePath}`;
    }

    return `${urlEndpoint}/${filePath}`;
}
