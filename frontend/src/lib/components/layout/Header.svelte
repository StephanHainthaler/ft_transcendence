<script>
  import { client } from "@lib/api/index.svelte";
  import { t } from "@lib/i18n/i18n";
  import { LayoutGrid, X } from "lucide-svelte";

  let shouldExpandMenu = false;

  const toggleMenu = () => {
    shouldExpandMenu = !shouldExpandMenu;
  };

</script>

<nav class="flex flex-row justify-between items-center w-full px-6 py-4 bg-teal shadow-md" id="header">
  <div class="flex items-center">
    <span class="text-white font-bold text-xl">
      {$t('main_name', 'Transcendence')}
    </span>
  </div>

  <div
    role='menu'
    tabindex="-1"
    class="flex flex-col place-items-center relative"
    on:mouseenter={() => shouldExpandMenu = true}
    on:mouseleave={() => shouldExpandMenu = false}
  >
    <button class="btn flex items-center gap-2" on:click={toggleMenu}>
      <LayoutGrid size={18} />
      {$t('menu', 'Menu')}
    </button>

    <div
      aria-label='menu-dropdown'
      role="listbox"
      class="w-48 bg-white text-teal text-left transition-all duration-300 rounded-lg shadow-lg absolute right-0 mt-2 z-[9999] py-1 {shouldExpandMenu ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2 pointer-events-none'}"
    >
      </div>
  </div>
</nav>