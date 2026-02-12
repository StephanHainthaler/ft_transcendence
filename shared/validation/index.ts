// --- Constants ---
export const USERNAME_MAX_LENGTH = 20;
export const DISPLAY_NAME_MAX_LENGTH = 20;
export const PASSWORD_MIN_LENGTH = 8;
export const AVATAR_MAX_BYTES = 5 * 1024 * 1024;
export const AVATAR_ALLOWED_MIME_TYPES = ['image/png', 'image/jpeg', 'image/webp'] as const;

// --- Validators (return string on error, null on success) ---

const usernameRegex = /^[0-9a-z._]+$/;

export function validateUsername(value: string | undefined): string | null {
  if (!value || value.length === 0) return 'Username is required';
  if (value.length > USERNAME_MAX_LENGTH) return `Username must be at most ${USERNAME_MAX_LENGTH} characters`;
  if (!usernameRegex.test(value)) return 'Username may only contain lowercase letters, digits, dots and underscores';
  if (/^[._]/.test(value) || /[._]$/.test(value)) return 'Username must not start or end with a dot or underscore';
  if (/[._ ]{2}/.test(value)) return 'Username must not contain consecutive separators';
  return null;
}

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateEmail(value: string | undefined): string | null {
  if (!value || value.length === 0) return 'Email is required';
  if (!emailRegex.test(value)) return 'Invalid email address';
  return null;
}

export function validatePassword(value: string | undefined): string | null {
  if (!value || value.length === 0) return 'Password is required';
  if (value.length < PASSWORD_MIN_LENGTH) return `Password must be at least ${PASSWORD_MIN_LENGTH} characters`;
  if (!/[A-Z]/.test(value)) return 'Password must contain at least one uppercase letter';
  if (!/[a-z]/.test(value)) return 'Password must contain at least one lowercase letter';
  if (!/[0-9]/.test(value)) return 'Password must contain at least one digit';
  return null;
}

export function validateDisplayName(value: string | undefined): string | null {
  if (!value || value.length === 0) return 'Display name is required';
  if (value.length > DISPLAY_NAME_MAX_LENGTH) return `Display name must be at most ${DISPLAY_NAME_MAX_LENGTH} characters`;
  return null;
}

export function validateAvatarMimeType(mimeType: string): string | null {
  if (!(AVATAR_ALLOWED_MIME_TYPES as readonly string[]).includes(mimeType))
    return `Invalid file type. Allowed: PNG, JPEG, WebP`;
  return null;
}

export function validateAvatarSize(sizeInBytes: number): string | null {
  if (sizeInBytes > AVATAR_MAX_BYTES) return `File too large. Maximum size is ${AVATAR_MAX_BYTES / (1024 * 1024)}MB`;
  return null;
}
