<script lang="ts">
  import '$lib/i18n';
  import './layout.css';
  import favicon from '$lib/assets/favicon.ico';
  import * as SB from "$lib/components/ui/sidebar";
  import Sidebar from '@lib/components/layout/Sidebar.svelte';
  import { afterNavigate, beforeNavigate, goto } from '$app/navigation';
  import { client } from '@lib/api/index.svelte';
  import { Toaster } from '@lib/components/ui/sonner';
  import { onMount } from 'svelte';

  let { children } = $props();
  let sidebarOpen = $state(false);

  onMount(async () =>{
    if (!client.isLoggedIn)
      goto('/auth');
  })

  beforeNavigate((nav) => {
    const target = nav.to;
    if (target?.route.id !== '/' && !target?.route.id?.includes('auth')) {
      if (!client.isLoggedIn) {
        goto('/auth', { replaceState: true });
      }
    }
  })

  afterNavigate((nav) => {
    const target = nav.to;
    if (target?.route.id !== '/' && !target?.route.id?.includes('auth')) {
      if (!client.isLoggedIn) {
        goto('/auth');
      }
    }
  })
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
