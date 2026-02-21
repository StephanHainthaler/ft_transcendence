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

const diffStyles = {
  1: "bg-easy text-white shadow-[0_0_25px_var(--chart-2)] opacity-100 hover:shadow-[0_0_35px_var(--chart-2)] hover:brightness-110", 
  2: "bg-medium text-black shadow-[0_0_25px_var(--chart-3)] opacity-100 hover:brightness-110",
  3: "bg-hard text-white shadow-[0_0_25px_var(--chart-1)] opacity-100 hover:bg-hard/90 hover:shadow-[0_0_35px_var(--chart-1)] hover:brightness-110"
};

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
              variant="easy"
              class="transition-all duration-300 uppercase font-black text-xs sm:text-sm overflow-hidden
                {AIdifficulty === 1 
                  ? diffStyles[1] 
                  : 'bg-chart-2/40 text-white hover:bg-chart-2 hover:text-white opacity-100'}"
              onclick={() => (AIdifficulty = 1)}
            >
              {$t('game.easy', 'Easy')}
            </Button>

            <Button 
              class="transition-all duration-300 uppercase font-black text-xs md:text-sm overflow-hidden
                {AIdifficulty === 2 
                  ? diffStyles[2] 
                  : 'bg-chart-3/40 text-white hover:bg-chart-3 hover:text-white opacity-100'}"
              onclick={() => (AIdifficulty = 2)}
            >
              {$t('game.medium', 'Medium')}
            </Button>

            <Button 
            variant="hard"
              class="transition-all duration-300 uppercase font-black text-xs sm:text-sm overflow-hidden
                {AIdifficulty === 3 
                  ? diffStyles[3] 
                  : 'bg-chart-1/40 text-white hover:bg-chart-1 hover:text-white opacity-100'}"
              onclick={() => (AIdifficulty = 3)}
            >
              {$t('game.hard', 'Hard')}
            </Button>

          </div>
        </div>
      </div>
      <div class="flex items-center justify-center size-full uppercase">
      {@render button()}
      </div>
    </div>
    </div>
  </div>
</Grid>

