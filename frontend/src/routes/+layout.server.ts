import { redirect, type Cookies } from "@sveltejs/kit";

export const ssr = false;

export async function load({ request, cookies }: { request: Request, cookies: Cookies }) {
  const token = request.headers.get('authorization');
  if (!token && !request.url.includes('/auth') && !cookies.get('refresh_token')) {
    redirect(302, '/auth');
  }
}
