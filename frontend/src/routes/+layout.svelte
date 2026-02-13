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

  let { data, children } = $props();
  let sidebarOpen = $state(false);

  $effect(() => {
    client.loggedIn = data.loggedIn;
  });

  onMount(async () => {
    console.log("The status of the user. IsLoggedIn:  ", data.loggedIn);
    if (client.loggedIn && client.status !== 'ready')
      await client.init();
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
