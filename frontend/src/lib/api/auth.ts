import type { SignupRequestBody, LoginRequestBody, AuthResponseSuccess, OAuthCallBackBody } from "@shared/api/authRequest";

import { request } from './utils';
import { toast } from "svelte-sonner";
import { t } from "$lib/i18n/i18n"
import { get } from "svelte/store";

const tr = get(t);

export async function updateRequest({
  email, user_name, passwd
}: {
  email?: string, user_name?: string, passwd?: string
}) {
  if (!email && !user_name && !passwd) {
    throw new Error("No Credentials to update!");
  }
  const req = new Request(`${import.meta.env.VITE_API_URL}/auth/update`, {
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

  const signupReq = new Request(`${import.meta.env.VITE_API_URL}/auth/sign-up`, {
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
  info: LoginRequestBody,
): Promise<AuthResponseSuccess> {
  if ((!info.user_name && !info.email))
    throw new Error("Missing Email of Username!");
  if (!info.passwd) throw new Error("Missing Password!");

  const login: Request = new Request(`${import.meta.env.VITE_API_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(info),
  });

  const data = await request(login);

  return data;
}

export async function oauthRequest(
  info: OAuthCallBackBody,
): Promise<AuthResponseSuccess> {
  if (!info.code)
    throw new Error("Missing OAuth Code!");

  const oauth: Request = new Request(`${import.meta.env.VITE_API_URL}/auth/github-oauth`, {
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
  const req = new Request(`${import.meta.env.VITE_API_URL}/auth/delete`, {
    method: 'delete',
  });

  try {
    await request(req);
  } catch (e: any) {
    toast.error('Failed to Delete Account');
  }
}

export async function logoutRequest() {
  const req = new Request(`${import.meta.env.VITE_API_URL}/auth/logout`, {
    method: 'post',
  });

  try {
    await request(req);
  } catch (e) {
    toast.error(tr('login.logout_fail') || 'Failed to log out');
  }
}

export async function getAuth() {
  const req = new Request(`${import.meta.env.VITE_API_URL}/auth`, {
    method: 'get',
  });

  const data = await request(req);

  return data;
}
