import { ApiError } from '@server/error/apiError';
import { parseJWT } from '@shared/api';

export function extractJWTFromHeader(tokenHeader?: string) {
  try {
    if (!tokenHeader || !tokenHeader.startsWith('Bearer ')) {
      console.error('Missing or invalid token header: ', tokenHeader);
      throw new ApiError({ message: 'Invalid token', code: 401 });
    }
    const token = parseJWT(tokenHeader.split(' ')[1]);
    return token;
  } catch (e: any) {
    throw new ApiError({ message: 'Invalid token', code: 401 });
  }
}
