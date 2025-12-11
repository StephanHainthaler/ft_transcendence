<script lang="ts">
  import * as Sidebar from "$lib/components/ui/sidebar";
  import { client } from "@lib/api";

  let isLoggedIn = $state(client?.isLoggedIn || false);

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
    {#if isLoggedIn}
    <Sidebar.Group>
      <Sidebar.GroupLabel>Routes</Sidebar.GroupLabel>
      <Sidebar.GroupContent>
        <Sidebar.Menu>
          <Sidebar.MenuItem>
            <Sidebar.MenuButton>
              <a class="px-4 w-full" href="/profile">Profile</a>
            </Sidebar.MenuButton>
          </Sidebar.MenuItem>
          <Sidebar.MenuItem>
            <Sidebar.MenuButton>
              <a class="px-4 w-full" href="/game">Game</a>
            </Sidebar.MenuButton>
          </Sidebar.MenuItem>
          <Sidebar.MenuItem>
            <Sidebar.MenuButton>
              <a class="px-4 w-full" href="/tournament">Tournament</a>
            </Sidebar.MenuButton>
          </Sidebar.MenuItem>
          <Sidebar.MenuItem>
            <Sidebar.MenuButton>
              <a class="px-4 w-full" href="/friends">Friends</a>
            </Sidebar.MenuButton>
          </Sidebar.MenuItem>
        </Sidebar.Menu>
      </Sidebar.GroupContent>
    </Sidebar.Group>
    <Sidebar.Separator />
    {/if}
    <Sidebar.Group>
      <Sidebar.GroupLabel>Account</Sidebar.GroupLabel>
      <Sidebar.GroupContent>
        <Sidebar.Menu>
          {#if isLoggedIn}
            <Sidebar.MenuItem>
              <Sidebar.MenuButton onclick={handleLogout}>
                <span class="px-4 w-full">Logout</span>
              </Sidebar.MenuButton>
            </Sidebar.MenuItem>
          {:else}
            <Sidebar.MenuItem>
              <Sidebar.MenuButton>
                <a class="px-4 w-full" href="/auth">Login</a>
              </Sidebar.MenuButton>
            </Sidebar.MenuItem>
          {/if}
        </Sidebar.Menu>
      </Sidebar.GroupContent>
    </Sidebar.Group>
  </Sidebar.Content>
  <Sidebar.Footer />
</Sidebar.Root>
