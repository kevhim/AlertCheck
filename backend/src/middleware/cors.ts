/**
 * CORS handling for Cloudflare Worker API.
 * Supports explicit comma-separated origin allowlist and safe origin reflection.
 */

export const DEFAULT_ALLOWED_ORIGINS = [
  'https://alertcheck-web.pages.dev',
  'http://localhost:5173',
  'http://127.0.0.1:5173',
];

/**
 * Parses a comma-separated allowlist of origins from configuration or environment.
 */
export function parseAllowedOrigins(allowedOriginConfig?: string): string[] {
  if (!allowedOriginConfig || !allowedOriginConfig.trim()) {
    return DEFAULT_ALLOWED_ORIGINS;
  }
  return allowedOriginConfig
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
}

/**
 * Determines whether a given Origin header is permitted.
 */
export function isOriginAllowed(origin: string | null, allowedOriginConfig?: string): boolean {
  if (!origin) {
    return false;
  }

  const allowedList = parseAllowedOrigins(allowedOriginConfig);

  // Exact match against configured allowlist
  if (allowedList.includes(origin)) {
    return true;
  }

  // Preserve localhost development support across local dev ports if localhost is present in allowlist
  const isLocalhost = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);
  if (isLocalhost && allowedList.some((allowed) => allowed.includes('localhost') || allowed.includes('127.0.0.1'))) {
    return true;
  }

  return false;
}

/**
 * Generates CORS response headers. Only reflects the requesting origin if it is explicitly allowed.
 * Never returns a wildcard '*' with user origins.
 */
export function getCorsHeaders(request: Request, allowedOriginConfig?: string): Record<string, string> {
  const origin = request.headers.get('Origin');
  const headers: Record<string, string> = {
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
    'Access-Control-Max-Age': '86400',
    'Vary': 'Origin',
  };

  if (origin && isOriginAllowed(origin, allowedOriginConfig)) {
    headers['Access-Control-Allow-Origin'] = origin;
  }

  return headers;
}

export function handleCorsPreflight(request: Request, allowedOriginConfig?: string): Response {
  return new Response(null, {
    status: 204,
    headers: getCorsHeaders(request, allowedOriginConfig),
  });
}

