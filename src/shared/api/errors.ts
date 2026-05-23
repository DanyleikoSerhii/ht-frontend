import { z } from 'zod';

export const ApiErrorBodySchema = z.object({
  code: z.string(),
  message: z.string(),
  details: z.record(z.string(), z.unknown()).optional(),
  fieldErrors: z.record(z.string(), z.array(z.string())).optional(),
});

export type ApiErrorBody = z.infer<typeof ApiErrorBodySchema>;

export type ApiErrorKind =
  | { kind: 'network' }
  | { kind: 'unauthorized' }
  | { kind: 'forbidden' }
  | { kind: 'notFound' }
  | { kind: 'validation'; fieldErrors: Record<string, string[]> }
  | { kind: 'conflict' }
  | { kind: 'rateLimited'; retryAfterSeconds: number | null }
  | { kind: 'server' }
  | { kind: 'unknown'; message: string };

export class ApiError extends Error {
  readonly status: number;
  readonly body: ApiErrorBody;
  readonly retryAfterSeconds: number | null;
  readonly requestId: string | undefined;

  constructor(params: {
    status: number;
    body: ApiErrorBody;
    retryAfterSeconds?: number | null;
    requestId?: string;
  }) {
    super(params.body.message);
    this.name = 'ApiError';
    this.status = params.status;
    this.body = params.body;
    this.retryAfterSeconds = params.retryAfterSeconds ?? null;
    this.requestId = params.requestId;
  }

  static async fromResponse(response: Response): Promise<ApiError> {
    const raw = await readBodySafe(response);
    const parsed = ApiErrorBodySchema.safeParse(raw);
    const body: ApiErrorBody = parsed.success
      ? parsed.data
      : { code: 'unknown', message: extractMessage(raw) ?? defaultMessage(response) };
    return new ApiError({
      status: response.status,
      body,
      retryAfterSeconds: parseRetryAfter(response.headers.get('retry-after')),
      requestId: response.headers.get('x-request-id') ?? undefined,
    });
  }
}

export function toApiErrorKind(err: unknown): ApiErrorKind {
  if (err instanceof ApiError) {
    return classifyApiError(err);
  }
  if (isNetworkError(err)) {
    return { kind: 'network' };
  }
  if (err instanceof Error) {
    return { kind: 'unknown', message: err.message };
  }
  return { kind: 'unknown', message: String(err) };
}

function classifyApiError(err: ApiError): ApiErrorKind {
  const { status, body } = err;
  if (status === 401) return { kind: 'unauthorized' };
  if (status === 403) return { kind: 'forbidden' };
  if (status === 404) return { kind: 'notFound' };
  if (status === 409) return { kind: 'conflict' };
  if (status === 422 && body.fieldErrors && Object.keys(body.fieldErrors).length > 0) {
    return { kind: 'validation', fieldErrors: body.fieldErrors };
  }
  if (status === 429) return { kind: 'rateLimited', retryAfterSeconds: err.retryAfterSeconds };
  if (status >= 500 && status <= 599) return { kind: 'server' };
  return { kind: 'unknown', message: body.message };
}

function isNetworkError(err: unknown): boolean {
  if (err instanceof TypeError) return true;
  if (err instanceof Error && (err.name === 'TimeoutError' || err.name === 'NetworkError')) {
    return true;
  }
  return false;
}

async function readBodySafe(response: Response): Promise<unknown> {
  try {
    const contentType = response.headers.get('content-type') ?? '';
    if (contentType.includes('application/json')) {
      return await response.json();
    }
    const text = await response.text();
    return text.length > 0 ? text : null;
  } catch {
    return null;
  }
}

function extractMessage(body: unknown): string | undefined {
  if (body && typeof body === 'object' && 'message' in body) {
    const candidate = (body as { message: unknown }).message;
    if (typeof candidate === 'string' && candidate.length > 0) {
      return candidate;
    }
  }
  return undefined;
}

function defaultMessage(response: Response): string {
  const status = response.status;
  const statusText = response.statusText;
  return statusText ? `HTTP ${status} ${statusText}` : `HTTP ${status}`;
}

function parseRetryAfter(value: string | null): number | null {
  if (!value) return null;
  const seconds = Number(value);
  return Number.isFinite(seconds) && seconds >= 0 ? seconds : null;
}
