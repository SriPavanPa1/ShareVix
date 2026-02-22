/**
 * Standard success response
 */
export function successResponse(data, message = 'Success', status = 200) {
    return new Response(
        JSON.stringify({
            success: true,
            message,
            data
        }),
        {
            status,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization'
            }
        }
    );
}

/**
 * Standard error response
 */
export function errorResponse(message = 'Error', status = 400) {
    return new Response(
        JSON.stringify({
            success: false,
            error: message
        }),
        {
            status,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization'
            }
        }
    );
}
