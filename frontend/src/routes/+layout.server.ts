import type { LayoutServerLoad } from "./$types";
import { redirect } from '@sveltejs/kit';

export const ssr = false;

export const load: LayoutServerLoad = async ({cookies, url}) =>
{
  const token = !!cookies.get('refresh_token');
  return {loggedIn: !!token};
}
