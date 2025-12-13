<script lang="ts">
  import { onMount } from "svelte";
  import * as Card from "$lib/components/ui/card";
  import { handleOAuthCallback } from "$lib/components/forms/OAuthForm.svelte";

  let errorMessage = "";

  onMount(async () => { // let code run automatically when page loads
      await handleOAuthCallback();
  });
</script>

<div class="w-full flex items-center justify-center p-4">
  <Card.Root class="w-full max-w-md shadow-xl">
    <Card.Content class="pt-6 w-full text-center">
      {#if errorMessage}
        <span class="text-red-500">{errorMessage}</span>
      {:else}
        <span class="text-muted-foreground">
          Completing GitHub OAuth…
        </span>
      {/if}
    </Card.Content>
  </Card.Root>
</div>
