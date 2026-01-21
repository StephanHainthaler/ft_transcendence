<script lang="ts">
  import './layout.css';
  import favicon from '$lib/assets/favicon.svg';
  import * as SB from "$lib/components/ui/sidebar";
  import Sidebar from '@lib/components/layout/Sidebar.svelte';
  import { afterNavigate, beforeNavigate, goto } from '$app/navigation';
  import { client } from '@lib/api/index.svelte';
  import { Toaster } from '@lib/components/ui/sonner';
  import { onMount } from 'svelte';

  let { children } = $props();
  let sidebarOpen = $state(false);

  onMount(async () =>{
    try {
      await client.getSession();
    } catch (e: any) {
      console.error(e);
      goto('/auth');
    }
  })

  beforeNavigate(async (nav) => {
    const target = nav.to;
    try {
      await client.getSession();
    } catch (e: any) {
    }
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
    sidebarOpen = false;
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
