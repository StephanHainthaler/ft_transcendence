<script lang="ts">
  import '$lib/i18n';
  import '../app.css';
  import favicon from '$lib/assets/favicon.png';
  import * as SB from "$lib/components/ui/sidebar";
  import Sidebar from '@lib/components/layout/Sidebar.svelte';
  import { beforeNavigate, goto } from '$app/navigation';
  import { client } from '@lib/api/index.svelte';
  import { Toaster } from '@lib/components/ui/sonner';
  import { onMount } from 'svelte';

  let { children } = $props();
  let sidebarOpen = $state(false);

  onMount(async () => {
      console.log("Checking session status...");
      try {
        if (client.loggedIn && client.status !== 'ready')
          await client.init();
      } catch (err) {
        console.error("Session invalid on backend. Logging out...");
        client.loggedIn = false;
        client.user = null;
        goto('/auth', { replaceState: true });
      }
  })

  beforeNavigate((nav) => {
    const target = nav.to;
    if (!nav.to)
      return;
    if (target?.route.id !== '/' && !target?.route.id?.includes('auth')) {
      if (!client.loggedIn)
      {
        nav.cancel();
        goto('/auth', { replaceState: true });
      }
    }
  });

</script>

<svelte:head>
  <link rel="icon" href={favicon} />
</svelte:head>

<Toaster richColors position='top-center'/>

<SB.Provider bind:open={sidebarOpen} class="h-screen">
  <Sidebar />
  <main class='flex flex-col flex-1 box-border bg-background '>
    <SB.Trigger />
    <div class="flex-1 min-h-0 py-[2%] px-[5%] md:px-[10%]">
      {@render children()}
    </div>
  </main>
</SB.Provider>
