import speakeasy from 'speakeasy';
import QRCode from 'qrcode';
import { db, AuthUser } from './db';
import { encrypt, decrypt } from './totpUtils';
import { eq } from '@server/orm';

const TOTP_ISSUER = process.env.TOTP_ISSUER || 'ft_transcendence';

// generate TOTP setup (secret + QR code)

export async function setupTotp(user: AuthUser): Promise<{ secret: string; qrCodeUrl: string }>
{
  const secret = speakeasy.generateSecret({
    name: `${TOTP_ISSUER}:${user.user_name || user.email}`,
    issuer: TOTP_ISSUER,
  });

  const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url!);

  // store encrypted secret (not enabled yet)
  db.from('auth_users')
    .update({ totp_secret: encrypt(secret.base32), two_fa_enabled: 0 })
    .where(eq('id', user.id))
    .run();

  return { secret: secret.base32, qrCodeUrl };
}


export function enableTotp(user: AuthUser, token: string): boolean
{
  if (!user.totp_secret) throw new Error('Run setup first');

  const valid = speakeasy.totp.verify({
    secret: decrypt(user.totp_secret),
    encoding: 'base32',
    token,
    window: 1,
  });

  if (valid) {
    db.from('auth_users').update({ two_fa_enabled: 1 }).where(eq('id', user.id)).run();
  }
  return valid;
}

export function disableTotp(user: AuthUser): void {
  db.from('auth_users')
    .update({ 
      two_fa_enabled: 0, 
      totp_secret: null, 
      backup_codes: null 
    })
    .where(eq('id', user.id))
    .run();

  user.two_fa_enabled = 0;
  user.totp_secret = undefined;
}

export function verifyTotp(user: AuthUser, token: string): boolean
{
  if (!user.totp_secret || !user.two_fa_enabled) return false;

  return speakeasy.totp.verify({
    secret: decrypt(user.totp_secret),
    encoding: 'base32',
    token,
    window: 2,
  });
}


export const is2FAEnabled = (user: AuthUser) => user.two_fa_enabled === 1;