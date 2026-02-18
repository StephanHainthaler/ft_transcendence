<script lang="ts">
  import * as Alert from "$lib/components/ui/alert";
  import Button from "$lib/components/ui/button/button.svelte";
  import { CircleAlertIcon } from "@lucide/svelte";
  import {t} from "@lib/i18n/i18n";

  let errorMessage: Error | null = $state(null);
  let userError = $state('');

  function generateState() {
    return crypto.randomUUID();
  }

  async function GithubRedirect(info: Record<string, string>) {
    // Внутрішня технічна помилка (для розробника)
    if (!info.client_id || !info.redirect_uri || !info.state) {
      throw new Error("Missing OAuth configuration. Check your .env file!");
    }
    try {
      const params = new URLSearchParams(info);
      const oauthUrl = `https://github.com/login/oauth/authorize?${params.toString()}`;

      window.location.href = oauthUrl;
    } catch (e: any) {
      errorMessage = new Error(`OAuth Failed: ${e.message || e}`);
      // Користувацька помилка з дефолтом
      userError = $t('OAuth.error', 'Authentication failed. Please try again.');
      console.error(errorMessage);
      throw errorMessage;
    }
  }

  const handleOAuthRequest = async (e: Event) => {
    e.preventDefault();
    e.stopPropagation();

    const state = generateState();
    sessionStorage.setItem("oauth_state", state);

    const info = {
      client_id: import.meta.env.VITE_GITHUB_CLIENT_ID,
      redirect_uri: import.meta.env.VITE_GITHUB_REDIRECT_URL,
      state,
      allow_signup: 'true',
      scope: 'read:user user:email'
    };

    try {
      await GithubRedirect(info);
    } catch (e: any) {
      errorMessage = new Error(`GH Redirect Failed: ${e.message || e}`);
      userError = $t('OAuth.error1', $t('OAuth.error', 'GitHub redirection failed.'));
      console.error(errorMessage);
    }
  };
</script>

<form onsubmit={handleOAuthRequest}>
  <Button type="submit" class="w-full">
    {$t('OAuth.oauth_gh', 'Sign in with GitHub')}
  </Button>
  
  {#if errorMessage}
  <Alert.Root variant='destructive' class="mt-4">
    <CircleAlertIcon />
    <Alert.Title>{$t('OAuth.error', 'Error')}</Alert.Title>
    <Alert.Description>
      <p>{userError || $t('error.general', 'Something went wrong...')}</p>
    </Alert.Description>
  </Alert.Root>
  {/if}
</form>