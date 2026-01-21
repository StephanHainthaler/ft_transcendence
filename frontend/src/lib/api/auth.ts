import type { SignupRequestBody, LoginRequestBody, AuthResponseSuccess, OAuthCallBackBody } from "@shared/api/authRequest";
import { request } from './utils';
import { parseJWT, type JWT } from "@shared/api";
import type { Writable } from "@lib/types/writable";
import { toast } from "svelte-sonner";

export async function updateRequest( {
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

  const response = await request(req);

  const data: AuthResponseSuccess = await response.json();
  if (!response.ok) {
    throw data;
  }
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

  const response = await fetch(signupReq);

  const data: AuthResponseSuccess = await response.json();
  if (!response.ok || !data.access_token)
    throw data;

  return data;
}

export async function loginRequest(
  
  info: LoginRequestBody,
): Promise<AuthResponseSuccess> {
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
  const data: AuthResponseSuccess = await response.json();

  if (!response.ok || !data.access_token)
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

  const response = await fetch(oauth);

  if (!response.ok) {
    throw new Error("OAuth token exchange failed");
  }

  const data: AuthResponseSuccess = await response.json();

  if (!data.access_token) throw data;

  const jwt = parseJWT(data.access_token);
  token.set(jwt);

  return data;
}

export async function deleteRequest(token: Writable<JWT | null>) {
  const req = new Request('/api/auth/delete', {
    method: 'delete',
    headers: {
      'Authorization': `Bearer ${token.get()?.raw}`,
    }
  });

  try {
    await request(req, token);
  } catch (e: any) {
    toast.error('Failed to Delete Account');
  } finally {
    token.set(null);
  }
}

export async function logoutRequest(token: Writable<JWT | null>) {
  const req = new Request('/api/auth/logout', {
    method: 'post',
    headers: {
      'Authorization': `Bearer ${token.get()?.raw}`,
    }
  });

  try {
    await request(req, token);
  } catch {
    toast.error('Failed to log out');
  } finally {
    token.set(null);
  }
}

export async function getAuth(token: Writable<JWT | null>) {
  const req = new Request('/api/auth', {
    method: 'get',
    headers: {
      'Authorization': `Bearer ${token.get()?.raw}`,
    }
  })

  const response = await request(req, token);
  const data = await response.json();
  if (!response.ok) {
    throw data;
  }
  return data;
}
