<script lang="ts">
  import { onMount } from "svelte";
  import * as Card from "$lib/components/ui/card";
  import { handleOAuthCallback } from "$lib/components/forms/OAuthForm.svelte";

  let errormessage = '';
  let success = false;

  onMount(async () => { // let code run automatically when page loads
    try {  
      await handleOAuthCallback();
      success = true; 
    } catch (e: any) {
      errormessage = e.message || e;
    }
  });
</script>

<div class="w-full flex items-center justify-center p-4">
  <Card.Root class="w-full max-w-md shadow-xl">
    <Card.Content class="pt-6 w-full text-center">
      <div class={`p-4 ${ errormessage.length > 0 ? success ? 'bg-green-300' : 'bg-red-300' : ''}` }>
        {errormessage}
      </div>
    </Card.Content>
  </Card.Root>
</div>
