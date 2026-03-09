import type { LayoutServerLoad } from "./$types";
import { redirect } from '@sveltejs/kit';

export const ssr = false;

export const load: LayoutServerLoad = async ({cookies, url}) =>
{
  const token = !!cookies.get('refresh_token');
  const PoliciesTermsPages = url.pathname === '/privacy-policy' || url.pathname === '/terms-of-service';
  const isAuthPage = url.pathname === '/auth' || url.pathname.startsWith('/auth');
  if (!token && !isAuthPage && !PoliciesTermsPages)
  {
    if (url.pathname !== '/')
      throw redirect(302, '/auth');
  }
}
