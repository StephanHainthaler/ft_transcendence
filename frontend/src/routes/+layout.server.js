import { redirect } from "@sveltejs/kit";

export const load = async ({ url, cookies }) => {
  const isAuth = url.pathname.startsWith('/auth');
  console.log("RUNNING LOAD")
  if (!isAuth && !cookies.get('refresh_token')) {
    redirect(302, '/auth');
  }
}
