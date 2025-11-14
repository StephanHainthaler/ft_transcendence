type InputType = 'username' | 'email';

interface ValidationResult {
  input?: string,
  valid: boolean,
  type?: InputType,
}

const emailRegex = new RegExp(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
const usernameRegex = new RegExp(/^[0-9a-z._]+$/)

export function validateInputThrow(input?: string, {
  type,
}:{
  type?: InputType,
} = {}) {
  if (!input) throw new Error(`Missing ${type || 'input'}!`);

  if (type && type === 'email') {
    console.log('input in validation', input);
    if (!emailRegex.test(input)) throw new Error('Invalid email address');
  }

  if (type && type === 'username') {
    if (!(usernameRegex.test(input) &&
      !input.startsWith('.') &&
      !input.startsWith('_') &&
      !input.endsWith('.') &&
      !input.endsWith('_') &&
      !input.includes('..') &&
      !input.includes('__') &&
      !input.includes('._') &&
      !input.includes('_.'))) {
      throw new Error('Invalid Username');
    }
  }
  return input;
}

export function validateInput(input?: string, {
  type,
}:{
  type?: InputType,
} = {}): ValidationResult {
  if (!input) return { valid: false };

  if (type && type === 'email') {
    const valid = emailRegex.test(input);
    if (valid)
      return { input, valid, type };
    else
      return { valid, type };
  }

  if (type && type === 'username') {
    if (usernameRegex.test(input) &&
        !input.startsWith('.') &&
        !input.startsWith('_') &&
        !input.endsWith('.') &&
        !input.endsWith('_') &&
        !input.includes('..') &&
        !input.includes('__') &&
        !input.includes('._') &&
        !input.includes('_.')
    ) {
      return { type, valid: true, input }
    } else {
      return { type, valid: false }
    }
  }
  return { valid: true, input };
}
