<script lang="ts">
  import './layout.css';
  import favicon from '$lib/assets/favicon.svg';
  import * as SB from "$lib/components/ui/sidebar";
  import Sidebar from '@lib/components/layout/Sidebar.svelte';

  let { children } = $props();
</script>

<svelte:head>
  <link rel="icon" href={favicon} />
</svelte:head>

<SB.Provider>
  <Sidebar />
  <main class='flex flex-col size-full bg-background'>
    <SB.Trigger />
    {@render children()}
  </main>
</SB.Provider>
