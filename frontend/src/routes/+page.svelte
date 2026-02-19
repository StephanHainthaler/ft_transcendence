<script lang="ts">
  import { t } from "@lib/i18n/i18n";
  import Banner from '$lib/assets/Banner.png';
  import { client } from "@lib/api/index.svelte";
  import { Play, Trophy, ArrowLeftRight } from "lucide-svelte";
  import { goto } from "$app/navigation";

const userName = $derived.by(() => {
    if (!client || client.status === 'error')
      return "Guest_Agent";
    if (client.status === 'loading')
      return "Guest_Agent";
    if (client.user) {
      return client.user.displayName || client.user.name || client.user.user_name || "Unknown_Pilot";
    }
    return "Guest_Agent";
  });

</script>

<div class="p-8 space-y-6 max-w-7xl mx-auto font-sans">
  <header class="relative p-6 border-l-4 border-primary bg-primary/5 backdrop-blur-sm">
    <h1 class="text-2xl md:text-4xl font-black uppercase italic tracking-tighter text-white">
      {$t('welcome') || "Welcome"} <span class="text-primary drop-shadow-[0_0_15px_rgba(var(--primary-rgb),0.6)]">{userName}</span>
    </h1>
  </header>
  
  <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
    
    <div class="md:col-span-2 relative aspect-[21/9] md:aspect-[3/1] overflow-hidden border border-white/10 group bg-black/20 backdrop-blur-md hover:border-primary/50 transition-all duration-500">
      <div class="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-70 group-hover:via-primary transition-all duration-500"></div>

      <img 
        src={Banner} 
        alt="Welcome Banner" 
        class="absolute inset-0 h-full w-full object-contain 
           contrast-[1.1] saturate-[1.2] brightness-[1.05]
           transition-transform duration-700 group-hover:scale-105"
      />

      <div class="absolute inset-0 bg-primary/0 group-hover:bg-primary/5 transition-colors duration-500"></div>
      <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
      
      <div class="absolute bottom-4 left-6 flex items-center gap-2">
         <div class="hidden lg:inline-block size-2 bg-primary animate-pulse shadow-[0_0_8px_rgba(var(--primary-rgb),0.8)]"></div>
         <span class="hidden lg:inline-block text-[10px] font-mono text-primary uppercase tracking-[0.4em] drop-shadow-[0_0_5px_rgba(var(--primary-rgb),0.5)]">
            {$t('moto') || "Fly High, Fight Hard!"}
         </span>
      </div>
    </div> <button 
      class="group relative overflow-hidden border-2 border-primary/30 bg-primary/5 p-8 transition-all hover:border-primary hover:bg-primary/10"
      onclick={() => {goto('/game')}}
    >
      <div class="relative flex items-center gap-6">
        <div class="p-3 bg-primary/10 border border-primary/20 group-hover:bg-primary group-hover:text-black transition-all">
          <Play class="size-8" fill="currentColor" />
        </div>
        <div class="md:table-cell text-left max-w-[250px] align-middle truncate pr-2">
          <h2 class="text-2xl sm:text-3xl font-black text-white uppercase tracking-tighter italic group-hover:text-primary">
            {$t('play') || "Play Now"}
          </h2>
        </div>
      </div>
      <ArrowLeftRight class="size-20 text-primary/5 absolute -right-4 -bottom-4 rotate-12 group-hover:scale-110 transition-transform" />
    </button>

    <button 
      class="group relative overflow-hidden border-2 border-accent/20 bg-accent/5 p-8 transition-all hover:border-accent hover:bg-accent/10"
      onclick={() => {goto('/tournament')}}
    >
      <div class="relative flex items-center gap-6">
        <div class="p-3 bg-accent/10 border border-accent/20 group-hover:bg-accent group-hover:text-black transition-all">
          <Trophy class="size-8" fill="currentColor" />
        </div>
        <div class="md:table-cell text-left max-w-[250px] align-middle truncate pr-2">
          <h2 class="text-2xl sm:text-3xl font-black text-white uppercase tracking-tighter italic group-hover:text-accent">
            {$t('tournament.tournament', 'Tournament') || "Tournament"}
          </h2>
        </div>
      </div>
      <Trophy class="size-10 sm:size-20 text-accent/5 absolute -right-4 -bottom-4 -rotate-12 group-hover:scale-110 transition-transform" />
    </button>

  </div>
</div>
