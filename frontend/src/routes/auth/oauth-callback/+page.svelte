<script lang="ts">
  import { onMount } from "svelte";
  import * as Card from "$lib/components/ui/card";
  import * as Alert from "$lib/components/ui/alert";
  import { CircleAlertIcon, CircleIcon } from "@lucide/svelte";
  import { goto } from "$app/navigation";
  import { client } from "$lib/api/index.svelte";
  import { buttonVariants } from "@lib/components/ui/button";
  import { t } from "@lib/i18n/i18n";
    import { toast } from "svelte-sonner";
    import type { resolve } from "path";

  let isLoading = $state(true);
  let errorMessage = $state('');

  // (3) function will be called /oauth-callback
  // It will extract the code and state out of redirect_uri
  export async function handleOAuthCallback() {
    try {
      const params = new URLSearchParams(window.location.search); // url looks like this after redirect_uri: http://localhost:8080/oauth-callback/?code=secretcode&state=abc

      const code = params.get("code");
      const state_ret = params.get("state");
      const state = sessionStorage.getItem("oauth_state");

      if (!state_ret || state_ret !== state) {
        throw new Error("Error. CSRF validation failed. A third party might have created the request. Please try again.");
      }

      if (!code) { // check if code was sent back - need to exchange this code for an access_token 
        throw new Error("Error. OAuth code was not returned from GitHub.");
      }

      sessionStorage.removeItem("oauth_state");

      // (4) send to backend to make POST request to endpoint, which then exchanges the GH code for an access_token `https://github.com/login/oauth/access_token`;
      await client.oauth({ code: code });
    } catch (e: any) {
      const consoleError = new Error(`OAuth Failed: ${e.message || e}`)
      console.error(consoleError);
      errorMessage = $t('OAuth.error2', (e.message || e));
      isLoading = false;
      toast.error(errorMessage);
      throw consoleError;
    }
    toast.success($t('OAuth.success', 'OAuth Successful'));
    goto("/");
  }
  
  
  onMount(async () => { // let code run automatically when page loads
    try {
      await handleOAuthCallback();
    } catch (e: any) {
    }
  });
</script>

<div class="w-full flex items-center justify-center p-4">
  <Card.Root class="w-full max-w-md shadow-xl">
    <Card.Header>
      <Card.Title>{$t('OAuth.redirect', 'OAuth Redirect')}</Card.Title>
    </Card.Header>
    <Card.Content class="pt-6 w-full flex flex-col gap-4">
      {#if !isLoading}
        <Alert.Root variant='destructive'>
          <CircleAlertIcon />
          <Alert.Title>{$t('OAuth.error2', 'Something went wrong...')}</Alert.Title>
          <Alert.Description>
            {errorMessage}
          </Alert.Description>
        </Alert.Root>
        <a class={`pr-4 ${buttonVariants({ variant: 'outline' })}`} href="/auth">{$t('OAuth.error2', 'Something went wrong...')}</a>
      {:else}
        <Alert.Root variant='default'>
          <CircleIcon />
          <Alert.Title>{$t('OAuth.wait', 'Waiting for OAuth completion') || 'Waiting for OAuth completion'}</Alert.Title>
          <Alert.Description>
            {$t('OAuth.loading', 'Completing GitHub OAuth...')}
          </Alert.Description>
        </Alert.Root>
      {/if}
    </Card.Content>
  </Card.Root>
</div>
