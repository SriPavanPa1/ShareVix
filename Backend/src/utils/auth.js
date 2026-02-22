// Web Crypto API compatible with Cloudflare Workers

/**
 * Hash password using SHA-256
 */
export async function hashPassword(password) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Compare password with hash
 */
export async function comparePassword(password, hash) {
    const hashedInput = await hashPassword(password);
    return hashedInput === hash;
}

/**
 * Generate JWT token
 */
export async function generateToken(user, secret, expiryDays = 7) {
    const header = { alg: 'HS256', typ: 'JWT' };
    const payload = {
        userId: user.id,
        email: user.email,
        exp: Math.floor(Date.now() / 1000) + (expiryDays * 24 * 60 * 60)
    };

    const encodedHeader = base64UrlEncode(JSON.stringify(header));
    const encodedPayload = base64UrlEncode(JSON.stringify(payload));
    const signature = await sign(`${encodedHeader}.${encodedPayload}`, secret);

    return `${encodedHeader}.${encodedPayload}.${signature}`;
}

/**
 * Verify JWT token
 */
export async function verifyToken(token, secret) {
    try {
        const parts = token.split('.');
        if (parts.length !== 3) return null;

        const [encodedHeader, encodedPayload, signature] = parts;
        const expectedSignature = await sign(`${encodedHeader}.${encodedPayload}`, secret);

        if (signature !== expectedSignature) return null;

        const payload = JSON.parse(base64UrlDecode(encodedPayload));

        if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
            return null; // Token expired
        }

        return payload;
    } catch (error) {
        return null;
    }
}

/**
 * Get user roles from database
 */
export async function getUserRoles(supabase, userId) {
    // Try with join first
    const { data, error } = await supabase
        .from('user_roles')
        .select('role_id, roles(role_name)')
        .eq('user_id', userId);

    if (error) {
        console.error('Error fetching user roles:', error);
        return [];
    }

    // Extract role names from join result
    let roleNames = data.map(ur => ur.roles?.role_name).filter(Boolean);

    // If join failed to get names (e.g. no FK) but we have role_ids, try manual lookup
    if (roleNames.length === 0 && data.length > 0) {
        const roleIds = data.map(ur => ur.role_id);
        const { data: rolesData } = await supabase
            .from('roles')
            .select('role_name')
            .in('id', roleIds);

        if (rolesData) {
            roleNames = rolesData.map(r => r.role_name).filter(Boolean);
        }
    }

    return roleNames;
}

/**
 * Check if user has admin role
 */
export function isAdmin(roles) {
    return roles.includes('admin');
}

/**
 * Check if user has any of the specified roles
 */
export function hasRole(roles, requiredRoles) {
    return requiredRoles.some(role => roles.includes(role));
}

// Helper: HMAC signing
async function sign(data, secret) {
    try {
        const encoder = new TextEncoder();
        const key = await crypto.subtle.importKey(
            'raw',
            encoder.encode(secret),
            { name: 'HMAC', hash: 'SHA-256' },
            false,
            ['sign']
        );
        const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(data));
        return arrayBufferToBase64Url(signature);
    } catch (error) {
        console.error('Sign error:', error);
        throw error;
    }
}

// Helper: ArrayBuffer to Base64URL
function arrayBufferToBase64Url(buffer) {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.length; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    const base64 = btoa(binary);
    return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

// Helper: String to Base64URL
function base64UrlEncode(str) {
    const encoder = new TextEncoder();
    const data = encoder.encode(str);
    let binary = '';
    for (let i = 0; i < data.length; i++) {
        binary += String.fromCharCode(data[i]);
    }
    const base64 = btoa(binary);
    return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

// Helper: Base64URL to String
function base64UrlDecode(str) {
    str = str.replace(/-/g, '+').replace(/_/g, '/');
    while (str.length % 4) str += '=';
    const binary = atob(str);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
    }
    const decoder = new TextDecoder();
    return decoder.decode(bytes);
}
