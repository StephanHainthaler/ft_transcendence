<script lang="ts">
  import { AppUser } from "@lib/api/appUser";
  import Grid from "@lib/components/custom/Grid.svelte";
  import { client } from "@lib/api/index.svelte";
  import GridCard from "@lib/components/custom/GridCard.svelte";
  import * as Card from "$lib/components/ui/card";
  import * as Dialog from "$lib/components/ui/dialog/index.js";
  import Button from "@lib/components/ui/button/button.svelte";
  import { buttonVariants } from "@lib/components/ui/button";
  import { Label } from "$lib/components/ui/label/index.js";

  import { tick } from 'svelte';
  import { toast } from "svelte-sonner";
  import { t } from "@lib/i18n/i18n";

  import { Pong } from "@lib/game/pong";
  import type { MatchSubmissionData } from "@shared/game_stats";

  let users: AppUser[] = $state([]);
  let aiUser: AppUser = $state({} as AppUser);
  let isRunningGame = $state(false);
  let isShowingResults = $state(false);
  let canvas: HTMLCanvasElement | null = $state(null);
  let pong: Pong | null = $state(null);
  let matchData: MatchSubmissionData | null = $state(null);
  let challengingUser = $state({} as AppUser);
  let challengedUser = $state({} as AppUser);
  let pointsToWin = $state(10);
  let matchDurationInMinutes = $state(5);
  let AIdifficulty = $state(2);

  const loadPageData = async () =>
  {
    await tick();
    try
    {
      const data = await client.getUsers();
      console.log(data);
      users = data;

      //filter out current user
      if (client.user)
        users = users.filter((u) => u.id !== client.user!.id);

      //add new AI user
      aiUser = new AppUser({
        id: 0, //0 to indicate AI user
        name: "AI Opponent",
      }, null);
    }
    catch (e: any)
    {
      toast.error(`Failed to load Page Data: ${e.message || e}`)
    }
  }

  const challengeUser = async (challengedUser: AppUser) =>
  {
    isRunningGame = true;
    isShowingResults = false;

    await tick();
    console.log(challengedUser);

    if (client.user)
    {
      challengingUser = new AppUser(client.user, null);
      if (canvas)
        pong = new Pong(challengingUser, challengedUser, canvas, pointsToWin, matchDurationInMinutes, AIdifficulty, onGameEnd);
    }
  };

  const onGameEnd = (data: MatchSubmissionData)  =>
  {
    isRunningGame = false;
    isShowingResults = true;

    console.log(data);
    matchData = data;
    try
    {
      client.sendMatchResults(data);
    } 
    catch (e: any){
      console.error("GameEnd Error:", e.message);
    }
  };

  function formatDuration(durationMs: number) {
    const totalSeconds = Math.floor(durationMs / 1000);
    return `${Math.floor(totalSeconds / 60)}:${(totalSeconds % 60).toString().padStart(2, '0')}`;
  }

  function returnToChallengePage() : void
  {
		isRunningGame = false;
    isShowingResults = false;
	};

  async function startRematch()
  {
    if (pong)
    {
      isRunningGame = true;
      isShowingResults = false;

      await tick();
      pong.resetMatch(canvas!);
    }
  };

  loadPageData();

</script>


<div class='size-full flex flex-col justify-center items-center'>
  <Card.Root class='size-full flex flex-col'>
    <Card.Header>
      <Card.Title>{$t('game.game')}</Card.Title>
    </Card.Header>
    <Card.Content class='flex-1 min-h-0 overflow-hidden'>
      {#if !isRunningGame && !isShowingResults}
        <Grid title={$t('game.settings')}>
          <label>
            {$t('game.pointsToWin')}:
            <input type="number" bind:value={pointsToWin} min="1" max="20" />
            <input type="range" bind:value={pointsToWin} min="1" max="20" />
          </label>
          <label>
            {$t('game.matchDurationInMinutes')}:
            <input type="number" bind:value={matchDurationInMinutes} min="1" max="10" />
            <input type="range" bind:value={matchDurationInMinutes} min="1" max="10" />
          </label>
          <div class="flex items-center gap-4">
            <span class="font-medium">{$t('game.AIdifficulty')}:</span>
            <div class="flex gap-2">
              <Button size="sm" class={AIdifficulty === 1 ? "bg-green-600 text-white" : "bg-green-600 text-black hover:bg-green-300"} onclick={() => (AIdifficulty = 1)}>{$t('game.easy')}</Button>
              <Button size="sm" class={AIdifficulty === 2 ? "bg-yellow-400 text-white" : "bg-yellow-400 text-black hover:bg-yellow-300"} onclick={() => (AIdifficulty = 2)}>{$t('game.medium')}</Button>
              <Button size="sm" class={AIdifficulty === 3 ? "bg-red-600 text-white" : "bg-red-600 text-black hover:bg-red-300"} onclick={() => (AIdifficulty = 3)}>{$t('game.hard')}</Button>
            </div>
          </div>
          <div>
            <Dialog.Root>
              <Dialog.Trigger class={buttonVariants({ variant: "outline" })}>
                {$t('game.challengeAI')}
              </Dialog.Trigger>
              <Dialog.Content class="sm:max-w-[425px]">
                <Dialog.Header>
                  <Dialog.Title>{$t('game.rules')}</Dialog.Title>
                  <Dialog.Description>
                    {$t('game.rulesDescription')}
                  </Dialog.Description>
                </Dialog.Header>
                <div class="grid gap-4">
                  <div class="grid gap-3">
                    <p class="mb-3">{$t('game.howToPlay')}</p>
                    <p class="mb-3">{$t('game.howToWin')}</p>
                    <Label for="name-1">{$t('game.leftPlayer')}: {client.user!.name}</Label>
                    <Label for="name-1">{$t('game.rightPlayer')}: {$t('game.aiOpponent')}</Label>
                    <Label for="name-1">{$t('game.pointsToWin')}: {pointsToWin}</Label>
                    <Label for="name-1">{$t('game.matchDuration')}: {matchDurationInMinutes} {$t('game.minutes')}</Label>
                    <Label for="name-1">{$t('game.AIdifficulty')}: {AIdifficulty === 1 ? $t('game.easy') : AIdifficulty === 2 ? $t('game.medium') : $t('game.hard')}</Label>
                  </div>
                </div>
                <Dialog.Footer>
                  <Dialog.Close class={buttonVariants({ variant: "outline" })}>{$t('game.cancel')}</Dialog.Close>
                  <Button size="sm" onclick={() => challengeUser(aiUser)}>{$t('game.startMatch')}</Button>
                </Dialog.Footer>
              </Dialog.Content>
            </Dialog.Root>
          </div>
        </Grid>
        <Grid title={$t('game.challenge')}>
          {#each users as user}
            <Dialog.Root>
              <Dialog.Trigger class="w-full">
                <GridCard title={user.name} avatarUrl={user.avatarUrl} buttonDesc={$t('game.challenge')} callback={() => (challengedUser = user)}/>
              </Dialog.Trigger>
              <Dialog.Content class="sm:max-w-[425px]">
                <Dialog.Header>
                  <Dialog.Title>{$t('game.rules')}</Dialog.Title>
                  <Dialog.Description>{$t('game.rulesDescription')}</Dialog.Description>
                </Dialog.Header>
                <div class="grid gap-4">
                  <div class="grid gap-3">
                    <p class="mb-3">{$t('game.howToPlay')}</p>
                    <p class="mb-3">{$t('game.howToWin')}</p>
                    <Label for="name-1">{$t('game.leftPlayer')}: {client.user!.name}</Label>
                    <Label for="name-1">{$t('game.rightPlayer')}: {challengedUser.name}</Label>
                    <Label for="name-1">{$t('game.pointsToWin')}: {pointsToWin}</Label>
                    <Label for="name-1">{$t('game.matchDuration')}: {matchDurationInMinutes} {$t('game.minutes')}</Label>
                  </div>
                </div>
                <Dialog.Footer>
                  <Dialog.Close class={buttonVariants({ variant: "outline" })}>{$t('game.cancel')}</Dialog.Close>
                  <Button size="sm" onclick={() => challengeUser(user)}>{$t('game.startMatch')}</Button>
                </Dialog.Footer>
              </Dialog.Content>
            </Dialog.Root>
          {/each}
        </Grid>
      {:else if isRunningGame && !isShowingResults}
        <div class="size-full flex flex-col">
          <canvas bind:this={canvas} class='bg-black size-full' tabindex='0'></canvas>
        </div>
      {:else}
        <Card.Root class="flex-1 min-h-0 flex flex-col h-full">
          <Card.Header>
            <Card.Title>{$t('game.summary')}</Card.Title>
          </Card.Header>
          <Card.Content class="flex-1 min-h-0 overflow-hidden">
            {#if matchData}
              {$t('game.duration')}: {formatDuration(matchData.duration ?? 0)}
              <div class='h-full grid grid-cols-1 grid-rows-4 md:grid-rows-2 md:grid-cols-2 gap-2 p-2 md:p-8'>
                <Grid title={matchData.winner_id === matchData.player_one_id ? $t('game.win') : $t('game.lose')}>
                  <p class="mb-4">Player1: {challengingUser.name}</p>
                  <p class="mb-4">Score: {matchData.p1_score}</p>
                </Grid>
                <Grid title={matchData.winner_id === matchData.player_two_id ? $t('game.win') : $t('game.lose')}>
                  <p class="mb-4">Player2: {challengedUser.name}</p>
                  <p class="mb-4">Score: {matchData.p2_score}</p>
                </Grid>
                <Button size="sm" onclick={ returnToChallengePage } >
                  {$t('game.return')}
                </Button>
                <Button size="sm" onclick={ startRematch } >
                  {$t('game.rematch')}
                </Button>
              </div>
            {/if}
          </Card.Content>
        </Card.Root>
      {/if}
    </Card.Content>
  </Card.Root>
</div>
