import crypto from 'crypto';

const ALGO = 'aes-256-gcm';

function getRawKey(): Buffer
{
	const raw = (process.env.TOTP_ENC_KEY || '').trim();
	if (!raw) throw new Error('TOTP_ENC_KEY is not set');

	// Try base64 first. If decoding produces <32 bytes, fall back to utf8.
	let key = Buffer.from(raw, 'base64');
	if (key.length < 32) key = Buffer.from(raw, 'utf8');
	if (key.length < 32) throw new Error('TOTP_ENC_KEY must be at least 32 bytes');
	return (key.slice(0, 32));
}

// encrypt a UTF-8 string and return base64(iv|tag|ciphertext)

export function encrypt(plain: string): string
{
	const key = getRawKey();
	const iv = crypto.randomBytes(12);
	const cipher = crypto.createCipheriv(ALGO, key, iv);
	const ciphertext = Buffer.concat([cipher.update(plain, 'utf8'), cipher.final()]);
	const tag = cipher.getAuthTag();
	return (Buffer.concat([iv, tag, ciphertext]).toString('base64'));
}

// decrypt value produced by `encrypt` (expects base64 iv|tag|ciphertext)

export function decrypt(encStr: string): string
{
	const key = getRawKey();
	const data = Buffer.from(encStr, 'base64');
	if (data.length < 29) throw new Error('Invalid encrypted data');
	const iv = data.slice(0, 12);
	const tag = data.slice(12, 28);
	const ciphertext = data.slice(28);
	const decipher = crypto.createDecipheriv(ALGO, key, iv);
	decipher.setAuthTag(tag);
	const plain = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
	return (plain.toString('utf8'));
}

export function isKeyConfigured(): boolean
{
	try
    {
		getRawKey();
		return (true);
	} catch (e)
    {
		return (false);
	}
}

export function generateBackupCodes(n = 5): string[]
{
	return (Array.from({ length: n }).map(() => crypto.randomBytes(4).toString('hex')));
}

