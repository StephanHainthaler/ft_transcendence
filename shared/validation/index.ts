// --- Constants ---
export const USERNAME_MAX_LENGTH = 20;
export const DISPLAY_NAME_MAX_LENGTH = 20;
export const PASSWORD_MIN_LENGTH = 8;
export const AVATAR_MAX_BYTES = 5 * 1024 * 1024;
export const AVATAR_ALLOWED_MIME_TYPES = ['image/png', 'image/jpeg', 'image/webp'] as const;

// --- Validators (return string on error, null on success) ---

const usernameRegex = /^[0-9a-z._]+$/;

/*
*/
export function validateUsername(value: string | undefined): string | null {
  const base = 'validation.username';
  if (!value || value.length === 0) return `${base}.required`;
  if (value.length > USERNAME_MAX_LENGTH) return `${base}.max_len`;
  if (!usernameRegex.test(value)) return `${base}.symbols`;
  if (/^[._]/.test(value) || /[._]$/.test(value)) return `${base}.end_dot`;
  if (/[._ ]{2}/.test(value)) return `${base}.con_sep`;
  return null;
}

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateEmail(value: string | undefined): string | null {
  const base = 'validation.email';
  if (!value || value.length === 0) return `${base}.required`;
  if (!emailRegex.test(value)) return `${base}.invalid`;
  return null;
}

export function validatePassword(value: string | undefined): string | null {
  const base = 'validation.password';
  if (!value || value.length === 0) return `${base}.required`;
  if (value.length < PASSWORD_MIN_LENGTH) return `${base}.min_len`;
  if (!/[A-Z]/.test(value)) return `${base}.upper`;
  if (!/[a-z]/.test(value)) return `${base}.lower`;
  if (!/[0-9]/.test(value)) return `${base}.digit`;
  return null;
}

export function validateDisplayName(value: string | undefined): string | null {
  const base = 'validation.display'
  if (!value || value.length === 0) return `${base}.required`;
  if (value.length > DISPLAY_NAME_MAX_LENGTH) return `${base}.min_len`;
  return null;
}

export function validateAvatarMimeType(mimeType: string): string | null {
  if (!(AVATAR_ALLOWED_MIME_TYPES as readonly string[]).includes(mimeType))
    return `validation.avatar.mime`;
  return null;
}

export function validateAvatarSize(sizeInBytes: number): string | null {
  if (sizeInBytes > AVATAR_MAX_BYTES) return `validation.avatar.size`;
  return null;
}
