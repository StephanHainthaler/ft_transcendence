<script lang="ts">
  import { t } from "@lib/i18n/i18n";
  import Grid from "@lib/components/custom/Grid.svelte";
  import { Button } from "../ui/button";
    import type { Snippet } from "svelte";
    import NeonHeader from "../custom/NeonHeader.svelte";

  let { 
    AIdifficulty = $bindable(0),
    button,
  }: { 
    AIdifficulty: number,
    button: Snippet
  } = $props();
</script>

<Grid title="">
  <div class="-mt-8 mb-4">
    <NeonHeader
      text={$t('game.aiSettings', 'AI Settings')}
      size="x1" 
      level="h1" 
    />
  </div>
   <div class="col-span-2 size-full">
  <div class="w-full flex items-center justify-center size-full">
    <div class=" flex flex-col justify-between items-center size-full">
      <div class="flex flex-col size-full justify-center justify-center w-full gap-2 ml-autogap-4">
        <span class="text-white text-l md:text-xl font-bold p-3">{$t('game.AIdifficulty', 'AI Difficulty')}:</span>
        <div class="flex flex-row gap-4 w-full items-center justify-center">
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full">
            <Button 
              class="transition-all duration-300 {AIdifficulty === 1 
                ? 'bg-primary text-black shadow-[0_0_20px_rgba(var(--accent),0.4)]' 
                : 'bg-primary/5 text-primary border border-primary/20 hover:bg-primary/20'}" 
              onclick={() => (AIdifficulty = 1)}
            >
              {$t('game.easy', 'Easy')}
            </Button>

            <Button 
              class="transition-all duration-300 {AIdifficulty === 2 
                ? 'bg-white text-black shadow-[0_0_20px_rgba(255,255,255,0.3)]' 
                : 'bg-white/5 text-white/60 border border-white/10 hover:bg-white/10 hover:text-white'}" 
              onclick={() => (AIdifficulty = 2)}
            >
              {$t('game.medium', 'Medium')}
            </Button>

            <Button 
              class="transition-all duration-300 {AIdifficulty === 3 
                ? 'bg-secondary text-white shadow-[0_0_20px_rgba(var(--secondary-rgb),0.4)]' 
                : 'bg-secondary/5 text-secondary border border-secondary/20 hover:bg-secondary/20'}" 
              onclick={() => (AIdifficulty = 3)}
            >
              {$t('game.hard', 'Hard')}
            </Button>
          </div>
        </div>
      </div>
      <div class="flex items-center justify-center size-full">
      {@render button()}
      </div>
    </div>
    </div>
  </div>
</Grid>

