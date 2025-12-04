<script>
  import { client } from "@lib/api/index";

  let shouldExpandMenu = false;
  let isLoggedIn = client?.isLoggedIn || false;

  client?.onChange(() => {
    isLoggedIn = client.isLoggedIn;
  });

  const toggleMenu = () => {
    shouldExpandMenu = !shouldExpandMenu;
  };

  const handleLogout = () => {
    client.logout();
    toggleMenu();
  };
</script>

<nav class="flex flex-row justify-between items-center w-full px-6 py-4 bg-teal shadow-md" id="header">
  <div class="flex items-center">
    <h1 class="text-2xl font-bold text-white">
      <a href="/" class="hover:text-cream transition-colors">Transcendence</a>
    </h1>
  </div>

  <div
    role='menu'
    tabindex="-1"
    class="flex flex-col place-items-center relative"
    on:mouseenter={() => shouldExpandMenu = true}
    on:mouseleave={() => shouldExpandMenu = false}
  >
    <button class="btn" on:click={toggleMenu}>
      Menu
    </button>

    <div
      aria-label='menu-button'
      role="button"
      class="w-48 bg-white text-teal text-left transition-all duration-300 rounded-lg shadow-lg absolute right-0 mt-2 z-9999 py-1 {shouldExpandMenu ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2 pointer-events-none'}"
    >
      {#if isLoggedIn}
        <a class="block m-2 px-4 py-2 rounded-lg hover:bg-gray-100" href="/profile">Profile</a>
        <a class="block m-2 px-4 py-2 rounded-lg hover:bg-gray-100" href="/game">Game</a>
        <a class="block m-2 px-4 py-2 rounded-lg hover:bg-gray-100" href="/tournament">Tournament</a>
        <a class="block m-2 px-4 py-2 rounded-lg hover:bg-gray-100" href="/friend">Friends</a>
        <button class="block m-2 px-4 py-2 rounded-lg hover:bg-gray-100 w-full text-left" on:click={handleLogout}>
          Logout
        </button>
      {:else}
        <a class="block m-2 px-4 py-2 rounded-lg hover:bg-gray-100" href="/auth">Login</a>
      {/if}
    </div>
  </div>
</nav>
