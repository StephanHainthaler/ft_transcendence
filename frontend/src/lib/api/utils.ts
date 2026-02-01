export async function request(req: Request): Promise<any> {
  const response = await fetch(req, {
  credentials: 'include',
});
  const data = await response.json();
  if (!response.ok)
    throw data;
  return data;
}
