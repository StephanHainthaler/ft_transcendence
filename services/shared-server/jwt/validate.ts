import { ApiError } from '@server/error/apiError';
import { parseJWT } from '@shared/api';

export function extractJWTFromHeader(tokenHeader?: string) {
  if (!tokenHeader || !tokenHeader.startsWith('Bearer ')) {
    console.error('Missing or invalid token header: ', tokenHeader);
    throw new ApiError({ message: 'Invalid token', code: 401 });
  }
  return parseJWT(tokenHeader.split(' ')[1]);
}
