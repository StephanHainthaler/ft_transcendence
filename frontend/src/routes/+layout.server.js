import { redirect } from "@sveltejs/kit";

export const load = async ({ url, cookies }) => {
  const isAuth = url.pathname.startsWith('/auth');
  if (!isAuth && !cookies.get('refresh_token')) {
    redirect(302, '/auth');
  }
}
