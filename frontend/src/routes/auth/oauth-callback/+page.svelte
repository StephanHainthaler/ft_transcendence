<script lang="ts">
  import { onMount } from "svelte";
  import * as Card from "$lib/components/ui/card";
  import * as Alert from "$lib/components/ui/alert";
  import { CircleAlertIcon, CircleIcon } from "@lucide/svelte";
  import { goto } from "$app/navigation";
  import { client } from "$lib/api/index.svelte";
  import { buttonVariants } from "@lib/components/ui/button";
  import { t } from "@lib/i18n/i18n";

  let message = $state('');
  let success = $state(false);
  let error: Error | null = $state(null);

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
        throw new Error("Error. OAuth code was not returned.");
      }

      sessionStorage.removeItem("oauth_state");

      // (4) send to backend to make POST request to endpoint, which then exchanges the GH code for an access_token `https://github.com/login/oauth/access_token`;
      await client.oauth({ code: code });
    } catch (e: any) {
      const error = new Error(`OAuth Failed: ${e.message || e}`)
      console.error(error);
      //client.logout();
      throw error;
    }
    goto("/");
  }


  onMount(async () => { // let code run automatically when page loads
    try {
      message = 'Completing GitHub OAuth…';
      success = true;
      await handleOAuthCallback();
    } catch (e: any) {
      success = false;
      error = e.message || e;
    }
  });
</script>

<div class="w-full flex items-center justify-center p-4">
  <Card.Root class="w-full max-w-md shadow-xl">
    <Card.Header>
      <Card.Title>{$t('OAuth.redirect')}</Card.Title>
    </Card.Header>
    <Card.Content class="pt-6 w-full flex flex-col gap-4">
      {#if !success}
        <Alert.Root variant='destructive'>
          <CircleAlertIcon />
          <Alert.Title>{$t('OAuth.error2')}</Alert.Title>
          <Alert.Description>
            {error}
          </Alert.Description>
        </Alert.Root>
        <a class={`pr-4 ${buttonVariants({ variant: 'link' })}`} href="/auth">{$t('OAuth.error2')}</a>
      {:else}
        <Alert.Root variant='default'>
          <CircleIcon />
          <Alert.Title>Please wait.</Alert.Title>
          <Alert.Description>
            {message}
          </Alert.Description>
        </Alert.Root>
      {/if}
    </Card.Content>
  </Card.Root>
</div>
