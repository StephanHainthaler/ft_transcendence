<script lang="ts">
  import { Alert, AlertDescription } from "$lib/components/ui/alert";
  import Button from "$lib/components/ui/button/button.svelte";

  // see https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/authorizing-oauth-apps#web-application-flow
  // https://medium.com/@tony.infisical/guide-to-using-oauth-2-0-to-access-github-api-818383862591

  let errorMessage = $state("");

  function generateState() {
    return crypto.randomUUID();
  }

  // (2) Redirect user to GitHub
  async function GithubRedirect(info: Record<string, string>) {
    if (!info.client_id || !info.redirect_uri || !info.state) {
      throw new Error("Missing OAuth information!");
    }

    const params = new URLSearchParams(info);
    const oauthUrl = `https://github.com/login/oauth/authorize?${params.toString()}`;

    console.log(oauthUrl); // OK

    window.location.href = oauthUrl;
  }

  // (1) create a request
  const handleOAuthRequest = async (e: Event) => {
    e.preventDefault();
    e.stopPropagation();

    const state = generateState();
    console.log(state); // OK

    sessionStorage.setItem("oauth_state", state); // safe it in session

    const info = {
    client_id: 'Ov23likjrNVolqMyu8L5',
    redirect_uri: "http://localhost:8080/auth/oauth-callback", // frontend route for redirection
    // Cross-site request forgery (CSRF) is an attack that forces authenticated users to submit a request to a web application against which they are currently authenticated
    state, // create a CSRF token
    allow_signup: 'true',
    scope: 'read:user user:email' // https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/scopes-for-oauth-apps
    };

    await GithubRedirect(info);
  };
</script>

<script module lang="ts">
  import { goto } from "$app/navigation";
  import { client } from "$lib/api";

  // (3) function will be called /oauth-callback
  // It will extract the code and state out of redirect_uri
  export async function handleOAuthCallback() {
    const params = new URLSearchParams(window.location.search); // url looks like this after redirect_uri: http://localhost:8080/oauth-callback/?code=secretcode&state=abc

    const code = params.get("code");
    const state_ret = params.get("state");
    const state = sessionStorage.getItem("oauth_state");

    if (!state_ret || state_ret !== state) {
     throw new Error("Error. CSRF validation failed. A third party might have created the request. Aborting process...");
    }

    if (!code) { // check if code was sent back - need to exchange this code for an access_token 
      throw new Error("Error. OAuth code was not returned.");
    }

    sessionStorage.removeItem("oauth_state");

    // (4) send to backend to make POST request to endpoint, which then exchanges the GH code for an access_token `https://github.com/login/oauth/access_token`;
    await client.oauth({
        code: code
      });

    goto("/"); 
  }

</script>

<form onsubmit={handleOAuthRequest}>
  <button type="submit" class="w-full bg-blue-500 text-white py-2">
    OAuth with GitHub
  </button>
</form>