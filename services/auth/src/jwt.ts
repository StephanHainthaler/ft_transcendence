import crypto from "crypto";
import { AuthUser, db } from "./db";
import { refreshTokenLifetime } from "./dbHandlers";
import { type JWT } from "@shared/api";
import { User } from "@shared/user";
import { eq } from "@server/orm";

const jwtHeader = { alg: 'HS256', typ: "JWT" };
const jwtHeaderString = JSON.stringify(jwtHeader);
const lifeTimeMs = 1000 * 60 * 5;

export function generateJWT(user: Partial<User>, secret: string): JWT {
  if (!user?.id) throw new Error('Missing user id for token minting');
  const headerEnc = btoa(jwtHeaderString);
  const payload = {
    sub: user.id,
    iat: Date.now(),
    exp: lifeTimeMs,
  };
  const payloadEnc = btoa(JSON.stringify(payload));
  const hmac = crypto.createHmac('sha256', secret);
  const signature = hmac.update(headerEnc + "." + payloadEnc).digest('base64url');

  const rawString = `${headerEnc}.${payloadEnc}.${signature}`;
  const jwt: JWT = {
    raw: rawString,
    header: jwtHeader,
    payload,
    sig: signature,
  }

  return jwt;
}

export function generateRefreshTokenCookie(token: string): string {
  return `refresh_token=${token}; HttpOnly; Max-Age=${refreshTokenLifetime / 1000}; path=/; SameSite=strict`;
}

export function validateRefreshToken(user: Partial<AuthUser>, refreshToken: string) {
  if (!user?.id) throw new Error('Missing user id for refresh token validation');
  const session = db.from('sessions').select('*').where(eq('auth_id', user.id)).single();
  if (!session)
    throw new Error('No session for this user');
  const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
  if (tokenHash !== session.token)
    throw new Error('Invalid session Token');
  if (Date.now() > session.created_at + session.expires_in) {
    throw new Error('Session expired');
  }
}

export function validateJWT(jwt: JWT, secret: string) {
  const hmac = crypto.createHmac('sha256', secret);
  const [ header, payload ] = jwt.raw.split('.');
  const signature = hmac.update(`${header}.${payload}`).digest('base64url');
  if (signature !== jwt.sig)
    throw new Error("Invalid token signature");

  if (Date.now() > jwt.payload.iat + jwt.payload.exp)
    throw new Error("Token expired");
}
