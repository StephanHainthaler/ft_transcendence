import { button, h2, div, form } from "@lib/vdom";
import type { OAuthRequestBody } from "@shared/api/authRequest";

// see https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/authorizing-oauth-apps#web-application-flow
// https://medium.com/@tony.infisical/guide-to-using-oauth-2-0-to-access-github-api-818383862591

let errorMessage: string = '';

let updateFunc: (() => void) | null = null;

// (A) Redirect the user from the browser to GitHub
async function GithubRedirect(
    info: OAuthRequestBody,
) {

  if (!info.client_id || !info.redirect_uri || !info.state)
    throw new Error("Missing OAuth information!");
  
  const params = new URLSearchParams(info)
  const oauthUrl = `https://github.com/login/oauth/authorize?${params.toString()}`;

  console.log('Redirect to GitHub OAuth URL:', oauthUrl);
  
  window.location.href = oauthUrl;
}

function generateState() {
  return crypto.randomUUID();
}

export async function handleOAuthRequest(
   e: Event
) {
  e.preventDefault();
  e.stopPropagation();

  const state = generateState();
  sessionStorage.setItem("oauth_state", state); // safe it in session

  const info: OAuthRequestBody = {
    client_id: 'Ov23likjrNVolqMyu8L5',
    redirect_uri: "http://localhost:8080/callback",
    // Cross-site request forgery (CSRF) is an attack that forces authenticated users to submit a request to a web application against which they are currently authenticated
    state, // create a CSRF token - BugFix: store for specific client?
    allow_signup: 'true',
    scope: 'repo'
  };

  await GithubRedirect(info);
}


async function GithubGetToken(code: string | null) {

  // const accesshUrl = `https://github.com/login/oauth/access_token`;
  const accessEndpoint = `githubOAuth`

  await fetch(accessEndpoint, {
  method: 'POST',
    headers: { "content-type": 'application/json' },
    body: JSON.stringify({ code })
  });
}

export async function callbackFunction() {
  const params = new URLSearchParams(window.location.search); // url looks like this after redirect_uri: http://localhost:8080/?code=f34161fb93969efa515b&state=abc

  const code = params.get("code");
  const state_ret = params.get("state");
  const state = sessionStorage.getItem("oauth_state");

  if (!state_ret || state_ret != state) { // check for CSRF
    errorMessage = "Error. CSRF validation failed. A third party created the request. Aborting process ...";
    updateFunc?.();
    throw new Error(errorMessage);
  }

  if (!code ) { // check for CSRF
    errorMessage = "Error. OAuth code was not returned ..."
    updateFunc?.();
    throw new Error(errorMessage);
  }

  sessionStorage.removeItem("oauth_state");

  await GithubGetToken(code);
}

export const OAuthForm = (update: () => void) => {
  updateFunc = () => { update() };
  return (
    form({ class: 'space-y-4 px-8 pt-8' },
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
