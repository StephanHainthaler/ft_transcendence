import { ApiError } from '../error/apiError';
import { parseJWT } from '../../../shared/api';

export function extractJWTFromHeader(tokenHeader?: string) {
  try {
    if (!tokenHeader) throw new ApiError({ message: 'Missing Token', code: 401 });
    const token = parseJWT(tokenHeader);
    return token;
  } catch (e: any) {
    throw new ApiError({ message: e.message || e, code: 401 });
  }
}
