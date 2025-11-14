export type JWT = {
  raw: string,
  header: JWTHead,
  payload: JWTPayload,
  sig: string,
}

export type JWTHead = {
  alg: string,
  typ: string,
}

export type JWTPayload = {
  sub: number,
  iat: number,
  exp: number,
}

export function parseJWT(raw: string): JWT {
  const [header, payload, sig] = raw.split('.');
  const jwt: JWT = {
    header: JSON.parse(atob(header)),
    payload: JSON.parse(atob(payload)),
    sig,
    raw
  }
  return jwt;
}
