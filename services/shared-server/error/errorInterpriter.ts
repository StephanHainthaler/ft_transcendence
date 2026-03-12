import { ApiError } from "@server/error/apiError";
import { sqliteErrorToApiError } from "@server/orm/error";

function interpretError(error: any): ApiError | undefined {
    if (error instanceof ApiError) {
        return error;
    }
    if (error.code?.startsWith('SQLITE_') || error.name === 'SqliteError') {
        return sqliteErrorToApiError(error);
    }
    if (error.validation) {
        const newApierror =  new ApiError({ message: 'error.common.validation_failed',
        code: 400 });
        return newApierror;
    }
    if (error.name === 'AbortError' || error.code === 'ECONNREFUSED') {
    return new ApiError({ message: 'error.common.service_unavailable', code: 503 });
    }
    return new ApiError({message: 'error.common.unexpected', code: 400 });
}

export { interpretError };