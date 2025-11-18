import { parseJWT, type AuthResponseSuccess, type JWT } from "@shared/api";
import { client } from "./client";

export async function request(req: Request): Promise<Response> {
  const response = await fetch(req);

  if (!response.ok && response.status === 401) {
    const response = await refreshTokenRequest();
    if (!response.access_token) throw response;
    const jwt = parseJWT(response.access_token)
    client.jwt = jwt;
    return retryRequest(req);
  }
  return response;
}

export const retryRequest = async (req: Request) => {
  const retryReq = new Request(req, {
    headers: {
      ...Object.fromEntries(req.headers.entries()),
      'authorization': client.authHeader,
    }
  });

  return await fetch(retryReq);
}

export async function refreshTokenRequest(): Promise<AuthResponseSuccess> {
  const response = await fetch('/api/auth/refresh', {
    method: 'POST',
  });

  const data = await response.json();
  if (!response.ok) throw data;

  return data;
}
