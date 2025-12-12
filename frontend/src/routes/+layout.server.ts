import { redirect } from "@sveltejs/kit";

export const ssr = false;

export async function load({ request }: { request: Request }) {
  const token = request.headers.get('authorization');
  console.log(token);
  if (!token && !request.url.includes('/auth')) {
    redirect(302, '/auth');
  }
}
