<script lang="ts">
  import '$lib/i18n';
  import './layout.css';
  import favicon from '$lib/assets/favicon.svg';
  import * as SB from "$lib/components/ui/sidebar";
  import Sidebar from '@lib/components/layout/Sidebar.svelte';
  import { afterNavigate, beforeNavigate, goto } from '$app/navigation';
  import { client } from '@lib/api';
  import { useSidebar } from '$lib/components/ui/sidebar';

  let { children } = $props();
  let sidebarOpen = $state(false);

  beforeNavigate((nav) => {
    console.log(client.isLoggedIn);
    const target = nav.to;
    console.log(target);
    if (target?.route.id !== '/' && !target?.route.id?.includes('auth')
      && !target?.route.id?.includes('stats')//tempopary
      ) {
      if (!client.isLoggedIn) {
        console.log('cancel redirect')
        goto('/auth', { replaceState: true });
      }
    }
  })

  afterNavigate((nav) => {
    const target = nav.to;
    if (target?.route.id !== '/' && !target?.route.id?.includes('auth')) {
      if (!client.isLoggedIn) {
        console.log('redirecting')
        goto('/auth');
      }
    }
    sidebarOpen = false;
  })
</script>

<svelte:head>
  <link rel="icon" href={favicon} />
</svelte:head>

<SB.Provider bind:open={sidebarOpen} class="size-full">
  <Sidebar />
  <main class='flex flex-col flex-1 min-h-screen box-border w-full bg-background '>
    <SB.Trigger />
    <div class="py-[2%] size-full px-[5%] md:px-[10%]">
      {@render children()}
    </div>
  </main>
</SB.Provider>
