import { ApiError } from '@server/error/apiError';
import { parseJWT } from '@shared/api';

export function extractJWTFromHeader(tokenHeader?: string) {
  try {
    if (!tokenHeader) throw {};
    const token = parseJWT(tokenHeader);
    return token;
  } catch (e: any) {
    throw new ApiError({ message: 'Invalid token', code: 401 });
  }
}
