import type { SignupRequestBody, LoginRequestBody, AuthResponseSuccess, OAuthCallBackBody } from "@shared/api/authRequest";
import { request } from './utils';
import { toast } from "svelte-sonner";

export async function updateRequest({
  email, user_name, passwd
}: {
  email?: string, user_name?: string, passwd?: string
}) {
  if (!email && !user_name && !passwd) {
    throw new Error("No Credentials to update!");
  }
  const req = new Request('/api/auth/update', {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, user_name, passwd }),
  });

  const data = await request(req);

  return data;
}

export async function signupRequest(
  info: SignupRequestBody,
): Promise<AuthResponseSuccess> {
  if (!info.user_name || !info.email)
    throw new Error("Missing Email or Username!");
  if (!info.passwd) throw new Error("Missing Password!");

  const signupReq = new Request('/api/auth/sign-up', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(info),
  });

  const data = await request(signupReq);

  return data;
}

export async function loginRequest(
  info: LoginRequestBody & { totp_token?: string },
): Promise<AuthResponseSuccess & { requires_2fa?: boolean }> {
  if ((!info.user_name && !info.email))
    throw new Error("Missing Email of Username!");
  if (!info.passwd) throw new Error("Missing Password!");

  const login: Request = new Request('/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(info),
  });

  const response = await fetch(login);
  const data = await response.json();

  // 202 means 2FA is required
  if (response.status === 202 && data.requires_2fa)
    return { ...data, requires_2fa: true };

  if (!response.ok)
    throw data;

  return data;
}

export async function oauthRequest(
  info: OAuthCallBackBody,
): Promise<AuthResponseSuccess> {
  if (!info.code)
    throw new Error("Missing OAuth Code!");

  const oauth: Request = new Request('/api/auth/github-oauth', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(info),
  });

  const data = await request(oauth);

  return data;
}

export async function deleteRequest() {
  const req = new Request('/api/auth/delete', {
    method: 'delete',
  });

  try {
    await request(req);
  } catch (e: any) {
    toast.error('Failed to Delete Account');
  }
}

export async function logoutRequest() {
  const req = new Request('/api/auth/logout', {
    method: 'post',
  });

  try {
    await request(req);
  } catch (e) {
    toast.error('Failed to log out');
  }
}

export async function getAuth() {
  const req = new Request('/api/auth', {
    method: 'get',
  });

  const data = await request(req);

  return data;
}

// 2FA Functions

export async function setup2FA(): Promise<{ secret: string; qrCodeUrl: string }> {
  const req = new Request('/api/auth/2fa/setup', {
    method: 'POST',
  });

  return await request(req);
}

export async function enable2FA(totpToken: string): Promise<{ success: boolean; message: string }> {
  const req = new Request('/api/auth/2fa/enable', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ token: totpToken }),
  });

  return await request(req);
}
