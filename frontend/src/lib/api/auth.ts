import type { SignupRequestBody, LoginRequestBody, AuthResponseSuccess, OAuthCallBackBody } from "@shared/api/authRequest";
import { request } from './utils';
import { toast } from "svelte-sonner";
import { t, get } from "@lib/i18n/i18n";
import type { AppError } from "@lib/types/error";

export async function updateRequest({
  email, user_name, passwd
}: {
  email?: string, user_name?: string, passwd?: string
}) {
  if (!email && !user_name && !passwd) {
    
    throw Object.assign(new Error("auth_missing_credentials"), { 
    isAppError: true }) as AppError;
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
  info: SignupRequestBody, ): Promise<AuthResponseSuccess> {
  if (!info.user_name || !info.email)
    throw Object.assign(new Error("missing_email_or_username"), { 
    isAppError: true }) as AppError;
  if (!info.passwd) throw Object.assign(new Error("missing_pass"), { 
    isAppError: true }) as AppError;

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
  info: LoginRequestBody, ): Promise<AuthResponseSuccess> {
  if ((!info.user_name && !info.email)){
    throw Object.assign(new Error("missing_email_or_username"), { 
    isAppError: true }) as AppError;}
  if (!info.passwd) {
    throw Object.assign(new Error("missing_pass"), { 
    isAppError: true }) as AppError;}

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
  info: OAuthCallBackBody, ): Promise<AuthResponseSuccess> {
  if (!info.code)
    throw Object.assign(new Error("missing_OAuth_code"), { 
    isAppError: true }) as AppError;

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
    const tr = get(t);
    const message = tr('error.delete_acc_fail');
    toast.error( message || 'Failed to Delete Account');
    throw (e);
  }
}

export async function logoutRequest() {
  const req = new Request(`${import.meta.env.VITE_API_URL}/auth/logout`, {
    method: 'post',
  });

  try {
    await request(req);
  } catch (e) {
    const tr = get(t);
    const message = tr('error.log_out_fail');
    toast.error( message || 'Failed to log out');
    throw (e);
  }
}

export async function getAuth() {
  const req = new Request(`${import.meta.env.VITE_API_URL}/auth`, {
    method: 'get',
  });

  const data = await request(req);

  return data;
}
