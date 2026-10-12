import { handleCorsPreflight } from './middleware/cors';
import { handleWorkerError } from './middleware/errorHandler';
import { handleHealthRequest } from './routes/health';
import { handleVerifyRequest } from './routes/verify';
import { errorResponse } from './lib/response';
import { getCorsHeaders } from './middleware/cors';

export interface Env {
  ALLOWED_ORIGIN?: string;
}

export default {
  async fetch(request: Request, env: Env = {}, ctx: ExecutionContext): Promise<Response> {
    const allowedOrigin = env.ALLOWED_ORIGIN;

    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return handleCorsPreflight(request, allowedOrigin);
    }

    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method;

    try {
      // Health check endpoint
      if (method === 'GET' && (path === '/api/health' || path === '/health' || path === '/')) {
        return handleHealthRequest(request, allowedOrigin);
      }

      // Verification endpoint
      if (method === 'POST' && (path === '/api/verify' || path === '/verify')) {
        return await handleVerifyRequest(request, allowedOrigin);
      }

      // 404 Route Not Found
      return errorResponse(
        `Route not found: ${method} ${path}`,
        404,
        null,
        getCorsHeaders(request, allowedOrigin)
      );
    } catch (err) {
      return handleWorkerError(err, request, allowedOrigin);
    }
  },
};
