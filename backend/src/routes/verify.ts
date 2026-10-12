import { VerifyRequest, verifyWarning } from '@alertcheck/verification-core';
import { parseJsonBody } from '../lib/requestValidation';
import { errorResponse, jsonResponse } from '../lib/response';
import { getCorsHeaders } from '../middleware/cors';

export async function handleVerifyRequest(
  request: Request,
  allowedOrigin?: string
): Promise<Response> {
  const cors = getCorsHeaders(request, allowedOrigin);

  // Parse and validate incoming JSON body
  const parseResult = await parseJsonBody<VerifyRequest>(request);
  if (!parseResult.ok || !parseResult.data) {
    return errorResponse(
      parseResult.error || 'Invalid request payload',
      parseResult.status || 400,
      null,
      cors
    );
  }

  try {
    // Run deterministic verification using shared package
    const report = verifyWarning(parseResult.data, {
      engineMode: 'cloudflare_worker',
    });

    return jsonResponse(report, 200, cors);
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Verification processing error';
    return errorResponse(msg, 500, null, cors);
  }
}
