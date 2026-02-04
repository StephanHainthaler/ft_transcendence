import { ApiError } from "@server/error/apiError";

export function sqliteErrorToApiError(error: unknown): ApiError {
  if (error && typeof error === 'object' && 'code' in error) {
    const code = (error as any).code as string;
    const message = (error as any).message || 'Database error';

    if (error instanceof ApiError) return error;

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
        return new ApiError({ message: 'Database query error', code: 400 });

      case 'SQLITE_CONSTRAINT_DATATYPE':
        return new ApiError({ message: 'Invalid data type', code: 400 });
      
      case 'SQLITE_CONSTRAINT_COLLATION':
        return new ApiError({ message: 'String comparison constraint violation (collation mismatch)', code: 400 });
      
      case 'SQLITE_TOOBIG':
        return new ApiError({ message: 'Input data is too large for the database', code: 413 });

      case 'SQLITE_CANTOPEN':
        return new ApiError({ message: 'Database file cannot be opened', code: 503 });

      case 'SQLITE_IOERR':
        return new ApiError({ message: 'Disk I/O error occurred', code: 507 });

      case 'SQLITE_CORRUPT':
        return new ApiError({ message: 'Database integrity error, service temporarily unavailable', code: 503 });

      case 'SQLITE_READONLY':
        return new ApiError({ message: 'Database is in read-only mode', code: 403 });

      default:
        return new ApiError({ message: 'Unexpected internal error', code: 400 });
    }
  }
  return new ApiError({ message: 'Unknown error', code: 500 });
}
