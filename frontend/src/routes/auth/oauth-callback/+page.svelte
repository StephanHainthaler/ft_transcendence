<script lang="ts">
  import { onMount } from "svelte";
  import * as Card from "$lib/components/ui/card";
  import { handleOAuthCallback } from "$lib/components/forms/OAuthForm.svelte";

  let message = '';
  let success = false;

  onMount(async () => { // let code run automatically when page loads
    try {  
      message = 'Completing GitHub OAuth…';
      success = true; 
      await handleOAuthCallback();
    } catch (e: any) {
      success = false;
      message = e.message || e;
    }
  });
</script>

<div class="w-full flex items-center justify-center p-4">
  <Card.Root class="w-full max-w-md shadow-xl">
    <Card.Content class="pt-6 w-full text-center">
      <div class={`p-4 ${ message.length > 0 ? success ? 'bg-gray-700' : 'bg-red-300' : ''}` }>
        {message}
      </div>
    </Card.Content>
  </Card.Root>
</div>
