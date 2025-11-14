import type { Writable } from "@lib/types/writable";
import { request } from "./utils";
import type { JWT } from "@shared/api";

export async function getUser(accessToken: Writable<JWT | null>) {
  const req = new Request(`/api/user`, {
    method: "GET",
    headers: {
      'Authorization': `Bearer ${accessToken.get()?.raw}`
    },
  })
  const response = await request(req, accessToken);

  const data = await response.json();
  if (!response.ok) {
    throw data;
  }
  console.log(data);
  return data.user;
}
