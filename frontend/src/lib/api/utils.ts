import { Writable } from "@lib/types/writable";
import { parseJWT, type AuthResponseSuccess, type JWT } from "@shared/api";

export async function request(req: Request, accessToken: Writable<JWT | null>) {
  const response = await fetch(req);

  if (!response.ok && response.status === 401) {
    const response = await refreshTokenRequest();
    if (!response.access_token) throw response;
    const jwt = parseJWT(response.access_token)
    accessToken.set(jwt);
    return retryRequest(req, accessToken);
  }
  return response;
}

export const retryRequest = async (req: Request, accessToken: Writable<JWT | null>) => {
  const retryReq = new Request(req, {
    headers: {
      ...Object.fromEntries(req.headers.entries()),
      'authorization': `Bearer ${accessToken.get()?.raw}`
    }
  });

  const response = await fetch(retryReq);
  const data = await response.json();
  if (!response.ok) throw data;
  return data;
}

export async function refreshTokenRequest(): Promise<AuthResponseSuccess> {
  const response = await fetch('/api/auth/refresh', {
    method: 'POST',
  });

  const data = await response.json();
  if (!response.ok) throw data;

  return data;
}
