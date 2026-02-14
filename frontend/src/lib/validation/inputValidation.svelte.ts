import {
  validateUsername,
  validateEmail,
  validatePassword,
  validateDisplayName,
  validateAvatarMimeType,
  validateAvatarSize,
  AVATAR_ALLOWED_MIME_TYPES,
} from '@shared/validation';

import { t } from "@lib/i18n/i18n";
import { get } from 'svelte/store';

type InputType = 'username' | 'email' | 'password' | 'displayName';

interface ValidationResult {
  input?: string,
  valid: boolean,
  type?: InputType,
}

const validators: Record<InputType, (v: string | undefined) => string | null> = {
  username: validateUsername,
  email: validateEmail,
  password: validatePassword,
  displayName: validateDisplayName,
};

export function validateInputThrow(input?: string, {
  type,
}:{
  type?: InputType,
} = {}) {
  if (!input || input.length === 0) throw new Error(`Missing ${type || 'input'}!`);

  if (type) {
    const error = validators[type](input);
    if (error) throw new Error(get(t)(error));
  }
  return input;
}

export function validateInput(input?: string, {
  type,
}:{
  type?: InputType,
} = {}): ValidationResult {
  if (!input) return { valid: false };

  if (type) {
    const error = validators[type](input);
    if (error) return { valid: false, type };
    return { input, valid: true, type };
  }
  return { valid: true, input };
}

export function validateAvatarFile(file: File): string | null {
  const mimeError = validateAvatarMimeType(file.type);
  if (mimeError) return mimeError;
  const sizeError = validateAvatarSize(file.size);
  if (sizeError) return sizeError;
  return null;
}

export { AVATAR_ALLOWED_MIME_TYPES };
