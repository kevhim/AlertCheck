import { errorResponse } from '../lib/response';
import { getCorsHeaders } from './cors';

/**
 * Global safe error handler. Prevents internal implementation details or stack traces from leaking.
 */
export function handleWorkerError(error: unknown, request: Request, allowedOrigin?: string): Response {
  console.error('[AlertCheck Worker Error]', error);

  const cors = getCorsHeaders(request, allowedOrigin);

  if (error instanceof SyntaxError) {
    return errorResponse('Invalid JSON payload in request body', 400, null, cors);
  }

  const message = error instanceof Error ? error.message : 'An unexpected server error occurred';
  return errorResponse(message, 500, null, cors);
}
