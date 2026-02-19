import type { LayoutServerLoad } from "./$types";
import { redirect } from '@sveltejs/kit';

export const ssr = false;

export const load: LayoutServerLoad = async ({cookies, url}) =>
{
  const token = !!cookies.get('refresh_token');
  const isAuthPage = url.pathname === '/auth' || url.pathname.startsWith('/auth');
  if (!token && !isAuthPage)
  {
    if (url.pathname !== '/')
      throw redirect(302, '/auth');
  }
  return {loggedIn: !!token};
}
