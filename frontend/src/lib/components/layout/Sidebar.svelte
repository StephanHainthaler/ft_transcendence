<script lang="ts">
  import { goto } from "$app/navigation";
  import * as Sidebar from "$lib/components/ui/sidebar";
  import { client } from "@lib/api/index.svelte";
  import { toast } from "svelte-sonner";

  const isLoggedIn = $derived(client.loggedIn);

  const handleLogout = () => {
    client.logout();
    toast.success("Successfully logged out");
  };

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
            <Sidebar.MenuButton class="px-4" onclick={() => goto('/profile')}>
              Profile
            </Sidebar.MenuButton>
          </Sidebar.MenuItem>

          <Sidebar.MenuItem>
            <Sidebar.MenuButton class="px-4" onclick={() => goto('/stats')}>
              Statistics
            </Sidebar.MenuButton>
          </Sidebar.MenuItem>

          <Sidebar.MenuItem>
            <Sidebar.MenuButton class="px-4" onclick={() => goto('/game')}>
              Game
            </Sidebar.MenuButton>
          </Sidebar.MenuItem>

          <Sidebar.MenuItem>
            <Sidebar.MenuButton class="px-4" onclick={() => goto('/tournament')}>
              Tournament
            </Sidebar.MenuButton>
          </Sidebar.MenuItem>

          <Sidebar.MenuItem>
            <Sidebar.MenuButton class="px-4" onclick={() => goto('/friends')}>
              Friends
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
              <Sidebar.MenuButton class="px-4" onclick={handleLogout}>
                Logout
              </Sidebar.MenuButton>
            </Sidebar.MenuItem>
          {:else}
            <Sidebar.MenuItem>
              <Sidebar.MenuButton class="px-4" onclick={() => goto('auth')}>
                Login
              </Sidebar.MenuButton>
            </Sidebar.MenuItem>
          {/if}
        </Sidebar.Menu>
      </Sidebar.GroupContent>
    </Sidebar.Group>
  </Sidebar.Content>
  <Sidebar.Footer />
</Sidebar.Root>
