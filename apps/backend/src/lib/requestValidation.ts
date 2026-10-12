const MAX_BODY_BYTES = 64 * 1024; // 64 KB limit

export interface ParsedRequestResult<T> {
  ok: boolean;
  data?: T;
  error?: string;
  status?: number;
}

/**
 * Validates request size and parses JSON safely.
 */
export async function parseJsonBody<T>(request: Request): Promise<ParsedRequestResult<T>> {
  const contentType = request.headers.get('Content-Type') || '';
  if (!contentType.includes('application/json')) {
    return {
      ok: false,
      error: 'Content-Type must be application/json',
      status: 415,
    };
  }

  const contentLength = request.headers.get('Content-Length');
  if (contentLength && parseInt(contentLength, 10) > MAX_BODY_BYTES) {
    return {
      ok: false,
      error: `Request body exceeds maximum size limit of ${MAX_BODY_BYTES} bytes`,
      status: 413,
    };
  }

  const rawText = await request.text();
  if (!rawText || !rawText.trim()) {
    return {
      ok: false,
      error: 'Request body cannot be empty',
      status: 400,
    };
  }

  if (rawText.length > MAX_BODY_BYTES) {
    return {
      ok: false,
      error: `Request body exceeds maximum size limit of ${MAX_BODY_BYTES} bytes`,
      status: 413,
    };
  }

  try {
    const data = JSON.parse(rawText) as T;
    return { ok: true, data };
  } catch {
    return {
      ok: false,
      error: 'Malformed JSON payload in request body',
      status: 400,
    };
  }
}
