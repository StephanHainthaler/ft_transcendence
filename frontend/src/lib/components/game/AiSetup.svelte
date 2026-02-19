<script lang="ts">
  import { t } from "@lib/i18n/i18n";
  import Grid from "@lib/components/custom/Grid.svelte";
  import { Button } from "../ui/button";
    import type { Snippet } from "svelte";

  let { 
    AIdifficulty = $bindable(0),
    button,
  }: { 
    AIdifficulty: number,
    button?: Snippet
  } = $props();
</script>

<Grid title={$t('game.AIdifficulty')}>
  <div class="w-full flex items-center justify-center size-full">
    <div class=" flex flex-col justify-between items-center size-full">
      <div class="flex flex-col size-full justify-center justify-center w-full gap-2 ml-autogap-4">
        <div class="flex flex-row gap-4 w-full items-center justify-center">
          <Button class={AIdifficulty === 1 ? "text-white bg-green-600" : " text-black bg-green-600 hover:bg-green-300"} onclick={() => (AIdifficulty = 1)}>{$t('game.easy')}</Button>
          <Button class={AIdifficulty === 2 ? "text-white bg-yellow-400" : "text-black bg-yellow-400 hover:bg-yellow-300"} onclick={() => (AIdifficulty = 2)}>{$t('game.medium')}</Button>
          <Button class={AIdifficulty === 3 ? "text-white bg-red-600" : "text-black bg-red-600 hover:bg-red-300"} onclick={() => (AIdifficulty = 3)}>{$t('game.hard')}</Button>
        </div>
      </div>
      <div class="flex items-center justify-center size-full">
      {@render button?.()}
      </div>
    </div>
  </div>
</Grid>

