/**
 * CORS handling for Cloudflare Worker API.
 */

export function getCorsHeaders(request: Request, allowedOrigin?: string): Record<string, string> {
  const origin = request.headers.get('Origin') || '*';
  const targetOrigin = allowedOrigin || origin;

  return {
    'Access-Control-Allow-Origin': targetOrigin,
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
    'Access-Control-Max-Age': '86400',
  };
}

export function handleCorsPreflight(request: Request, allowedOrigin?: string): Response {
  return new Response(null, {
    status: 204,
    headers: getCorsHeaders(request, allowedOrigin),
  });
}
