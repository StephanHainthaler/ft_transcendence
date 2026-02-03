export async function request(req: Request): Promise<any> {
  const response = await fetch(req);

  let data;
  try {
    data = await response.json();
  } catch {}
  if (!response.ok && data)
    throw data;
  return data;
}
