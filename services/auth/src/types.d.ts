declare module 'speakeasy' {
  interface GenerateSecretOptions {
    name?: string;
    issuer?: string;
    length?: number;
    symbols?: boolean;
    otpauth_url?: boolean;
    google_auth_qr?: boolean;
  }

  interface GeneratedSecret {
    ascii: string;
    hex: string;
    base32: string;
    otpauth_url?: string;
    google_auth_qr?: string;
  }

  interface TotpVerifyOptions {
    secret: string;
    encoding?: 'ascii' | 'hex' | 'base32';
    token: string;
    window?: number;
    time?: number;
    step?: number;
    counter?: number;
  }

  interface TotpGenerateOptions {
    secret: string;
    encoding?: 'ascii' | 'hex' | 'base32';
    time?: number;
    step?: number;
    counter?: number;
    digits?: number;
    algorithm?: 'sha1' | 'sha256' | 'sha512';
  }

  export function generateSecret(options?: GenerateSecretOptions): GeneratedSecret;

  export namespace totp {
    function generate(options: TotpGenerateOptions): string;
    function verify(options: TotpVerifyOptions): boolean;
  }

  export namespace hotp {
    function generate(options: any): string;
    function verify(options: any): boolean;
  }
}

declare module 'qrcode' {
  export function toDataURL(text: string): Promise<string>;
  export function toDataURL(text: string, options: any): Promise<string>;
  export function toString(text: string): Promise<string>;
  export function toString(text: string, options: any): Promise<string>;
  export function toFile(path: string, text: string): Promise<void>;
  export function toFile(path: string, text: string, options: any): Promise<void>;
}
