import type { AppError } from "$lib/types/error";
import { client } from "./index.svelte";

export async function request(req: Request): Promise<any> {
  console.log("Sending request", `to: ${req.url}`);
  const response = await fetch(req, {
    credentials: 'include',
  });
  let data;
  try {
    data = await response.json();
  } catch {
    data = null;
  }
  if (!response.ok)
  {
    if (response.status === 401) 
      client.clearSession();
    let error: AppError = {
      message: data.message || 'An error occurred',
      code: data.code || response.status,
      extra: data.extra || null,
    };
    throw error;
  }
  return data;
}
