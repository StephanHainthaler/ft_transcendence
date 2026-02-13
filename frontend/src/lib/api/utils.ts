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
  if (!response.ok) {
    if (response.status == 401) {
      try { client.clearSession()} catch {}
    };
    throw data ?? { message: `Request failed with status ${response.status}` };
  }
  return data;
}
