import { ApiError } from "@server/error/apiError";

export function sqliteErrorToApiError(error: unknown): ApiError {
  if (error && typeof error === 'object' && 'code' in error) {
    const code = (error as any).code as string;
    const message = (error as any).message || 'Database error';

    console.error(error);

    switch (code) {
      case 'SQLITE_CONSTRAINT':
      case 'SQLITE_CONSTRAINT_UNIQUE':
        return new ApiError({ message: 'Resource already exists', code: 409 });

      case 'SQLITE_CONSTRAINT_FOREIGNKEY':
        return new ApiError({ message: 'Referenced resource does not exist', code: 400 });

      case 'SQLITE_CONSTRAINT_NOTNULL':
        return new ApiError({ message: 'Required field is missing', code: 400 });

      case 'SQLITE_CONSTRAINT_CHECK':
        return new ApiError({ message: 'Invalid data format', code: 400 });

      case 'SQLITE_EMPTY':
      case 'SQLITE_NOTFOUND':
        return new ApiError({ message: 'Resource not found', code: 404 });

      case 'SQLITE_PERM':
      case 'SQLITE_AUTH':
        return new ApiError({ message: 'Permission denied', code: 403 });

      case 'SQLITE_BUSY':
      case 'SQLITE_LOCKED':
        return new ApiError({ message: 'Database is busy', code: 503 });

      case 'SQLITE_FULL':
        return new ApiError({ message: 'Storage full', code: 507 });

      case 'SQLITE_ERROR':
      case 'SQLITE_MISUSE':
        return new ApiError({ message: 'Database query error', code: 500 });

      default:
        return new ApiError({ message: message || 'Database error', code: 500 });
    }
  }

  return new ApiError({ message: 'Unknown error', code: 500 });
}
