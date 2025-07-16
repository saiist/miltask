import type { ApiError } from '@otaku-secretary/shared';

export class ApiClientError extends Error {
  public readonly code: string;
  public readonly details?: Record<string, any>;

  constructor(apiError: ApiError) {
    super(apiError.message);
    this.name = 'ApiClientError';
    this.code = apiError.code;
    this.details = apiError.details;
  }

  static isApiError(error: any): error is ApiClientError {
    return error instanceof ApiClientError;
  }
}

export function createApiError(code: string, message: string, details?: Record<string, any>): ApiClientError {
  return new ApiClientError({ code, message, details });
}

export function isNetworkError(error: any): boolean {
  return error instanceof ApiClientError && error.code === 'NETWORK_ERROR';
}

export function isAuthError(error: any): boolean {
  return error instanceof ApiClientError && (
    error.code === 'UNAUTHORIZED' || 
    error.code === 'FORBIDDEN'
  );
}

export function isValidationError(error: any): boolean {
  return error instanceof ApiClientError && error.code === 'BAD_REQUEST';
}

export function isRateLimitError(error: any): boolean {
  return error instanceof ApiClientError && error.code === 'RATE_LIMIT';
}