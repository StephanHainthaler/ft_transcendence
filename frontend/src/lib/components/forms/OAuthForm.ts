import { button, h2, div, form } from "@lib/vdom";
import type { OAuthRequestBody } from "@shared/api/authRequest";

let errorMessage: string = '';

let updateFunc: (() => void) | null = null;

// (A) Redirect the user from the browser to GitHub
export async function GitHub_redirect(
    info: OAuthRequestBody,
) {
  if ((!info.client_id && !info.redirect_uri && !info.state && !info.allow_signup))
    throw new Error("Missing OAuth information!");
  
  const params = new URLSearchParams(info)
  const oauthUrl = `https://github.com/login/oauth/authorize?${params.toString()}`;

  console.log(info);
  const response = await fetch(oauthUrl, {
  method: 'GET',
  });

  if (!response.ok) throw new Error('GitHub OAuth request failed');
  console.log('Redirect to GitHub OAuth URL:', oauthUrl);
}

export async function handleOAuthRequest(
    info: OAuthRequestBody,
)  {
  info.client_id = 'Ov23likjrNVolqMyu8L5'
  info.redirect_uri = 'http://localhost:8080/game';
  info.state = 'xyz';
  // info.allow_signup = 'True';

  await GitHub_redirect(info);

}

export const OAuthForm = (update: () => void) => {
  updateFunc = () => { update() };
  return (
    form({ class: 'space-y-4 px-8 pt-8', onclick: updateFunc },
      div({ class: 'w-full gap-2 flex flex-col max-w-md' },
        h2({ class: 'text-2xl font-bold text-teal mb-6 text-center' }, 'OAuth'),
      ),
      div({
        class: errorMessage.length > 0 ? 'bg-red-400 text-sm p-4 w-full shadow-md rounded-md' : 'flex flex-grow',
        replace: true,
      }, errorMessage),
      div({ class: 'px-8 mt-auto' },
        button({ onclick: handleOAuthRequest, class: 'btn w-full mb-8 justify-self-end' }, 'OAuth with GitHub')
      )
    )
  )
}
