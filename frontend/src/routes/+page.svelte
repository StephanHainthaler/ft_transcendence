<script lang="ts">
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';
  import { client } from '@lib/api';
  import {t} from "@lib/i18n/i18n";

  onMount(() => {
    // Redirect to game or auth based on login status
    if (client.isLoggedIn) {
      goto('/game');
    }
  });
</script>

<div class="flex flex-col items-center justify-center h-full gap-4">
  <h1 class="text-4xl font-bold">{$t('main_name')}</h1>
  <p class="text-muted-foreground">Welcome to ft_transcendence!</p>
</div>
