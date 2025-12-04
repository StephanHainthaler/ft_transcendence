import type { SignupRequestBody, LoginRequestBody, AuthResponseSuccess } from "@shared/api/authRequest";
import { request } from './utils';
import { parseJWT, type JWT } from "@shared/api";
import type { Writable } from "@lib/types/writable";

export async function updateRequest(token: Writable<JWT | null>, {
  email, username, passwd
}: {
  email?: string, username?: string, passwd?: string
}) {
  if (!email && !username && !passwd) {
    throw new Error("No Credentials to update!");
  }
  const req = new Request('/api/auth/update', {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token.get()?.raw}`,
    },
    body: JSON.stringify({ email, username, passwd }),
  });

  const response = await request(req, token);

  const data: AuthResponseSuccess = await response.json();
  if (!response.ok) {
    throw data;
  }
  return data;
}

export async function signupRequest(
  token: Writable<JWT | null>,
  info: SignupRequestBody,
): Promise<AuthResponseSuccess> {
  if ((!info.username && !info.email))
    throw new Error("Missing Email of Username!");
  if (!info.passwd) throw new Error("Missing Password!");

  const signupReq = new Request('/api/auth/sign-up', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(info),
  });

  const response = await request(signupReq, token);

  const data: AuthResponseSuccess = await response.json();
  if (!response.ok || !data.access_token) throw data;
  const jwt = parseJWT(data.access_token);
  token.set(jwt);

  return data;
}

export async function loginRequest(
  info: LoginRequestBody,
): Promise<AuthResponseSuccess> {
  if ((!info.username && !info.email))
    throw new Error("Missing Email of Username!");
  if (!info.passwd) throw new Error("Missing Password!");

  console.log(info);
  const login: Request = new Request('/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(info),
  });

  const response = await fetch(login);
  const data: AuthResponseSuccess = await response.json();

  console.log(data);

  if (!response.ok || !data.access_token) throw data;
  return data;
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
    throw new Error('Failed to log out');
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
