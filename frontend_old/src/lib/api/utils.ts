import { parseJWT, type AuthResponseSuccess, type JWT } from "@shared/api";
import type { Writable } from "@lib/types/writable";

export async function request(req: Request, token: Writable<JWT | null>): Promise<Response> {
  const response = await fetch(req);

  if (!response.ok && response.status === 401) {
    const response = await refreshTokenRequest();
    if (!response.access_token) throw response;
    const jwt = parseJWT(response.access_token)
    token.set(jwt);
    return retryRequest(req, token);
  }
  return response;
}

export const retryRequest = async (req: Request, token: Writable<JWT | null>) => {
  const retryReq = new Request(req, {
    headers: {
      ...Object.fromEntries(req.headers.entries()),
      'authorization': `Bearer ${token.get()?.raw}`
    }
  });

  const response = await fetch(retryReq);
  const data = await response.json();
  if (!response.ok && response.status === 401) {
    throw data;
  }
  return data;
}

export async function refreshTokenRequest(): Promise<AuthResponseSuccess> {
  const response = await fetch('/api/auth/refresh', {
    method: 'POST',
  });

  const data = await response.json();
  if (!response.ok && response.status === 401) {
    throw data;
  }

  return data;
}
