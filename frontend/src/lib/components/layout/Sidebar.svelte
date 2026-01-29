<script lang="ts">
  import { goto } from "$app/navigation";
  import * as Sidebar from "$lib/components/ui/sidebar";
  import { client } from "@lib/api/index.svelte";
  import { currentLocale, t } from "@lib/i18n/i18n";
  import { toast } from "svelte-sonner";
  import image from '$lib/assets/favicon.png';

  const isLoggedIn = $derived(client.loggedIn);

  const handleLogout = () => {
    client.logout();
    toast.success("Successfully logged out");
  };

 </script>

<Sidebar.Root class="border-r border-primary/20 bg-black/80 backdrop-blur-xl">
  <Sidebar.Header class="p-8 border-b border-white/5">
    <h1 class="text-2xl font-black italic tracking-tighter text-white uppercase group">
      <a href="/" class="flex items-center gap-2 group-hover:text-primary transition-all">
      <div class="relative size-7 flex-shrink-0">
        <div class="absolute inset-0 bg-primary/20 blur-md rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
        
        <img 
          src={image}
          alt=""
          class="relative max-w-full max-h-full object-contain brightness-110"
        />
      </div>

      <span class="transition-all duration-300
               text-sm tracking-tight sm:text-base group-hover:translate-x-0.5 truncate shadow-sm">
        {$t('main_name')}
      </span>
    </a>
    </h1>
  </Sidebar.Header>

  <Sidebar.Content class="custom-scrollbar">
    {#if isLoggedIn}
    <Sidebar.Group>
      <Sidebar.GroupLabel class="px-4 py-3 text-[11px] font-black uppercase text-primary/40">
        {$t('sidebar.routes')}
      </Sidebar.GroupLabel>
      
      <Sidebar.GroupContent>
        <Sidebar.Menu class="gap-1">
          {#each [
            { path: '/profile', label: 'sidebar.profile' },
            { path: '/game', label: 'sidebar.game' },
            { path: '/tournament', label: 'sidebar.tournament' },
            { path: '/friends', label: 'sidebar.friends' },
            { path: '/stats', label: 'sidebar.statistics' }
          ] as route}
            <Sidebar.MenuItem>
              <Sidebar.MenuButton 
                class="px-4 py-5 rounded-none border-l-2 border-transparent hover:border-primary hover:bg-primary/5 hover:text-primary transition-all group"
                onclick={() => goto(route.path)}
              >
                <span class="font-bold uppercase tracking-widest text-[11px]">
                  {$t(route.label)}
                </span>
              </Sidebar.MenuButton>
            </Sidebar.MenuItem>
            <div class="h-[1px] w-full bg-gradient-to-r from-white/5 via-transparent to-transparent"></div>
          {/each}
        </Sidebar.Menu>
      </Sidebar.GroupContent>
    </Sidebar.Group>
    
    <Sidebar.Separator class="bg-primary/10 my-4" />
    {/if}

    <Sidebar.Group>
      <Sidebar.GroupLabel class="px-4 text-[11px] font-black uppercase text-primary/40">
        {$t('sidebar.account')}
      </Sidebar.GroupLabel>
      <Sidebar.GroupContent>
        <Sidebar.Menu>
          <Sidebar.MenuItem>
            <Sidebar.MenuButton 
              class="px-4 py-5 rounded-none border-l-2 border-transparent hover:border-primary hover:bg-primary/5 hover:text-primary transition-all group"
              onclick={isLoggedIn ? handleLogout : () => goto('/auth')}
            >
              <span class="font-bold uppercase tracking-widest text-[11px]">
                {isLoggedIn ? $t('sidebar.logout') : $t('sidebar.login')}
              </span>
            </Sidebar.MenuButton>
          </Sidebar.MenuItem>
        </Sidebar.Menu>
      </Sidebar.GroupContent>
    </Sidebar.Group>

    <Sidebar.Separator class="bg-primary/10 my-4" />

<Sidebar.Group>
  <Sidebar.GroupLabel class="px-4 text-[11px] font-black uppercase text-primary/40">
    {$t('sidebar.language')}
  </Sidebar.GroupLabel>
  <Sidebar.GroupContent>
    <div class="flex gap-2 px-4 py-4">
      {#each [
        { code: 'en', flag: '🇺🇸' },
        { code: 'ukr', flag: '🇺🇦' },
        { code: 'de', flag: '🇩🇪' }
      ] as lang}
        {@const isActive = $currentLocale === lang.code}
        <button 
          onclick={() => t.changeLanguage(lang.code)} 
          class="flex-1 flex flex-col items-center py-2 border transition-all group relative
            {isActive 
              ? 'border-primary bg-primary/10 shadow-[0_0_15px_rgba(var(--primary-rgb),0.2)]' 
              : 'border-white/5 hover:border-primary/50 hover:bg-primary/5'}"
        >
          <span class="text-xl transition-all {isActive ? 'drop-shadow-[0_0_5px_rgba(255,255,255,0.5)] scale-110' : 'opacity-70 group-hover:opacity-100'}">
            {lang.flag}
          </span>
          
          <span class="text-[10px] font-black mt-1 transition-colors
            {isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-primary/70'}">
            {lang.code.toUpperCase()}
          </span>

          {#if isActive}
            <div class="absolute -bottom-[1px] w-1/2 h-[2px] bg-primary shadow-[0_0_10px_var(--my-primary)]"></div>
          {/if}
        </button>
      {/each}
    </div>
  </Sidebar.GroupContent>
</Sidebar.Group>
  </Sidebar.Content>
</Sidebar.Root>
