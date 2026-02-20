<script lang="ts">
  import { t } from "@lib/i18n/i18n";
  import Banner from '$lib/assets/Banner.png';
  import { client } from "@lib/api/index.svelte";
  import BrandBanner from "@lib/components/custom/BrandBanner.svelte";
  import ActionCard from "@lib/components/custom/ActionCard.svelte";
  import { Play, Trophy, ArrowLeftRight } from "lucide-svelte";

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
  <BrandBanner
    imageSrc={Banner}
    altText="Welcome Banner"
    motto={String($t('moto', 'Fly High, Fight Hard!'))}
  />

  <ActionCard
    link="/play"
    icon={Play}
    icon_shade={ArrowLeftRight}
    colorClass="primary"
    title={String($t('play', 'Play Now'))}
  />

  <ActionCard
    link="/tournament"
    icon={Trophy}
    icon_shade={Trophy}
    colorClass="accent"
    title={String($t('tournament.tournament', 'Tournament'))}
  />

  </div>
</div>
