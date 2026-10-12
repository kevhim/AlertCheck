/**
 * Standardized JSON response helpers for Cloudflare Workers.
 */

export function jsonResponse(
  data: unknown,
  status = 200,
  headers: Record<string, string> = {}
): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'X-Content-Type-Options': 'nosniff',
      'Cache-Control': 'no-store, no-cache, must-revalidate',
      ...headers,
    },
  });
}

export function errorResponse(
  message: string,
  status = 400,
  details: unknown = null,
  headers: Record<string, string> = {}
): Response {
  return jsonResponse(
    {
      error: {
        message,
        status,
        details: details || undefined,
      },
    },
    status,
    headers
  );
}
