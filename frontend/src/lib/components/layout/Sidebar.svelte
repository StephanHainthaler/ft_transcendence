<script lang="ts">
  import * as Sidebar from "$lib/components/ui/sidebar";
  import { client } from "@lib/api";

  let isLoggedIn = client?.isLoggedIn || false;

  const handleLogout = () => {
    client.logout();
  };

  client?.onChange(() => {
    isLoggedIn = client.isLoggedIn;
  });
</script>

<Sidebar.Root>
  <Sidebar.Header>
    <h1 class="text-2xl font-bold">
      <a href="/">Transcendence</a>
    </h1>
  </Sidebar.Header>
  <Sidebar.Content>
    <Sidebar.Group>
      {#if isLoggedIn}
        <a class="block m-2 px-4 py-2 rounded-lg hover:bg-background/80" href="/profile">Profile</a>
        <a class="block m-2 px-4 py-2 rounded-lg hover:bg-background/80" href="/game">Game</a>
        <a class="block m-2 px-4 py-2 rounded-lg hover:bg-background/80" href="/tournament">Tournament</a>
        <a class="block m-2 px-4 py-2 rounded-lg hover:bg-background/80" href="/friend">Friends</a>
        <button class="block m-2 px-4 py-2 rounded-lg hover:bg-background/80 w-full text-left" on:click={handleLogout}>
          Logout
        </button>
      {:else}
        <a class="block m-2 px-4 py-2 rounded-lg" href="/auth">Login</a>
      {/if}
    </Sidebar.Group>
  </Sidebar.Content>
  <Sidebar.Footer />
</Sidebar.Root>
