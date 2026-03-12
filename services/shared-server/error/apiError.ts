export class ApiError extends Error {
  readonly code: number;
  readonly message: string;

  constructor({ message, code }: { message: string; code: number; }) {
    super(message);
    this.code = code;
    this.message = message;
    this.name = 'ApiError';
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ApiError);
    }
  }
}