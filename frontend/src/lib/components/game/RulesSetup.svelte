<script lang="ts">

  import { t } from "@lib/i18n/i18n";
  import Grid from "@lib/components/custom/Grid.svelte";
  import { Label } from "../ui/label";
  import { Input } from "../ui/input";
  import NeonHeader from "../custom/NeonHeader.svelte";

  let {
    pointsToWin = $bindable(),
    matchDurationInMinutes = $bindable(),
  }: {
    pointsToWin: number,
    matchDurationInMinutes: number,
  } = $props();

</script>

<Grid title="">
  <div class="-mt-8 mb-4">
    <NeonHeader
      text={$t('game.settings', 'Game Settings')} 
      size="x1" 
      level="h1" 
    />
  </div>
  <div class="w-full justify-center grid grid-cols-1 md:grid-cols-2 gap-2">
    <Label class="font-bold text-l md:text-xl">
      {$t('game.pointsToWin', 'Points to Win')}:
    </Label>
    <div>
      <Input type="number" bind:value={pointsToWin} min="1" max="20"/>
      <Input type="range" bind:value={pointsToWin} min="1" max="20"/>
    </div>
    <Label class="font-bold text-l md:text-xl">
      {$t('game.matchDurationInMinutes', 'Match Duration (minutes)')}:
    </Label>
    <div>
      <Input type="number" bind:value={matchDurationInMinutes} min="1" max="10"/>
      <Input type="range" bind:value={matchDurationInMinutes} min="1" max="10"/>
    </div>
  </div>
</Grid>
