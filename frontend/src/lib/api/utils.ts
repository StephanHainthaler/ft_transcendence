import { client } from "./index.svelte";

export async function request(req: Request): Promise<any> {
  console.log("Sending request", `to: ${req.url}`);
  const response = await fetch(req, {
    credentials: 'include',
  });
  let data;
  try {
    data = await response.json();
  } catch {}
  if (!response.ok && data) {
    if (response.status == 401) await client.logout();
    throw data;
  }
  return data;
}
