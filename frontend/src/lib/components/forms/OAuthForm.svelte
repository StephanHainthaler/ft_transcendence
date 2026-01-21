<script lang="ts">
  import * as Alert from "$lib/components/ui/alert";
  import Button from "$lib/components/ui/button/button.svelte";
  import { CircleAlertIcon } from "@lucide/svelte";
  import {t, currentLocale} from "@lib/i18n/i18n";

  // see https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/authorizing-oauth-apps#web-application-flow
  // https://medium.com/@tony.infisical/guide-to-using-oauth-2-0-to-access-github-api-818383862591

  let errorMessage: Error | null = $state(null);

  function generateState() {
    return crypto.randomUUID();
  }

  // (2) Redirect user to GitHub
  async function GithubRedirect(info: Record<string, string>) {
    if (!info.client_id || !info.redirect_uri || !info.state) {
      throw new Error("Missing OAuth information!");
    }
    try {
      const params = new URLSearchParams(info);
      const oauthUrl = `https://github.com/login/oauth/authorize?${params.toString()}`;

      window.location.href = oauthUrl;
    } catch (e: any) {
      errorMessage = new Error(`OAuth Failed: ${e.message || e}`)
      console.error(errorMessage);
    }
  }

  // (1) create a request
  const handleOAuthRequest = async (e: Event) => {
    e.preventDefault();
    e.stopPropagation();

    const state = generateState();
    console.log(state); // OK

    sessionStorage.setItem("oauth_state", state); // safe it in session

    const info = {
      client_id: import.meta.env.VITE_GITHUB_CLIENT_ID,
      redirect_uri: "http://localhost:8080/auth/oauth-callback", // frontend route for redirection
      // Cross-site request forgery (CSRF) is an attack that forces authenticated users to submit a request to a web application against which they are currently authenticated
      state, // create a CSRF token
      allow_signup: 'true',
      scope: 'read:user user:email' // https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/scopes-for-oauth-apps
    };

    try {
      await GithubRedirect(info);
    } catch (e: any) {
      errorMessage = new Error(`GH Redirect Failed: ${e.message || e}`)
      console.error(errorMessage);
    }

  };
</script>

<form onsubmit={handleOAuthRequest}>
  <Button type="submit" class="w-full bg-blue-500 text-white py-2">
    {$t('OAuth.oauth_gh')}
  </Button>
  {#if errorMessage}
  <Alert.Root variant='destructive'>
    <CircleAlertIcon />
    <Alert.Title>{$t('OAuth.error')}</Alert.Title>
    <Alert.Description>
      <p>{errorMessage.message}</p>
    </Alert.Description>
  </Alert.Root>
  {/if}
</form>
