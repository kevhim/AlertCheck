import { jsonResponse } from '../lib/response';
import { getCorsHeaders } from '../middleware/cors';

export function handleHealthRequest(request: Request, allowedOrigin?: string): Response {
  const cors = getCorsHeaders(request, allowedOrigin);

  return jsonResponse(
    {
      status: 'healthy',
      service: 'alertcheck-api',
      version: '1.0.0',
      engine: 'deterministic-rule-based',
      timestamp: new Date().toISOString(),
      offlineCapable: true,
      requiresAiKey: false,
    },
    200,
    cors
  );
}
