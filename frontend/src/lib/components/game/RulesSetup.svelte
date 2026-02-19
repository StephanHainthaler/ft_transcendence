<script lang="ts">

  import { t } from "@lib/i18n/i18n";
  import Grid from "@lib/components/custom/Grid.svelte";
  import { Label } from "../ui/label";
  import { Input } from "../ui/input";

  let {
    pointsToWin = $bindable(),
    matchDurationInMinutes = $bindable(),
  }: {
    pointsToWin: number,
    matchDurationInMinutes: number,
  } = $props();

</script>

<Grid title={$t('game.settings')}>
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
