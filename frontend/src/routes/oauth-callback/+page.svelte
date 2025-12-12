<script lang="ts">
  import { onMount } from "svelte";
  import { handleOAuthCallback } from "$lib/components/forms/OAuthForm.svelte";

  let errorMessage = "";

  onMount(async () => {
    try {
      await handleOAuthCallback();
    } catch (e) {
      errorMessage = e instanceof Error ? e.message : String(e);
    }
  });
</script>

<p class="text-center mt-8">
  {#if errorMessage}
    <span class="text-red-500">{errorMessage}</span>
  {:else}
    Completing GitHub OAuth…
  {/if}
</p>
