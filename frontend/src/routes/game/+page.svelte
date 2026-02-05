<script lang="ts">
  import { AppUser } from "@lib/api/appUser";
  import Grid from "@lib/components/custom/Grid.svelte";
  import { client } from "@lib/api/index.svelte";
  import GridCard from "@lib/components/custom/GridCard.svelte";
  import * as Card from "$lib/components/ui/card";
  import Button from "@lib/components/ui/button/button.svelte";

  import { tick } from 'svelte';
  import { toast } from "svelte-sonner";
  import { t } from "@lib/i18n/i18n";

  import { Pong } from "@lib/game/pong";
  import type { MatchSubmissionData } from "@shared/game_stats";

  let users: AppUser[] = $state([]);
  let aiUser: AppUser | null = $state(null);
  let isRunningGame = $state(false);
  let isShowingResults = $state(false);
  let canvas: HTMLCanvasElement | null = $state(null);
  let pong: Pong | null = $state(null);
  let matchData: MatchSubmissionData | null = $state(null);
  let challengingUser = {} as AppUser;
  let challengedUser = {} as AppUser;
  let pointsToWin = $state(10);
	let matchDurationInMinutes = $state(5);
  
  const loadPageData = async () =>
  {
    await tick();
    //await tick();
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
      users.push(aiUser);
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
        pong = new Pong(challengingUser, challengedUser, canvas, pointsToWin, matchDurationInMinutes, onGameEnd);
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
  <Card.Root class='size-full'>
    <Card.Header>
      <Card.Title>{$t('game.game')}</Card.Title>
    </Card.Header>
    <Card.Content class='size-full'>
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
        </Grid>
        <Grid title={$t('game.challenge')}>
          {#each users as user}
            <GridCard title={user.id === 0 ? $t('game.aiOpponent') : user.name} avatarUrl={user.avatarUrl} callback={() => challengeUser(user)} buttonDesc={$t('game.challenge')}/>
          {/each}
        </Grid>
      {:else if isRunningGame && !isShowingResults}
        <div class="size-full flex flex-col">
          <canvas bind:this={canvas} class='bg-black size-full' tabindex='0'></canvas>
        </div>
      {:else}
        <h2 class="text-2xl font-bold mb-4">{$t('game.summary')}</h2>
        {#if matchData}
          {#if matchData.winner_id === challengingUser.id}
          <p class="mb-2">{$t('game.win')}: {challengingUser.name} ({matchData.p1_score})</p>
          <p class="mb-4">{$t('game.lose')}: {challengedUser.name} ({matchData.p2_score})</p>
          {:else}
          <p class="mb-2">{$t('game.lose')}: {challengingUser.name} ({matchData.p1_score})</p>
          <p class="mb-4">{$t('game.win')}: {challengedUser.name} ({matchData.p2_score})</p>
          {/if}
          <p class="mb-4">{$t('game.duration')}: {matchData.duration} </p>
        {/if}
        <Button variant="tab" onclick={ returnToChallengePage } >
          {$t('game.return')}
        </Button>
        <Button variant="tab" onclick={ startRematch } >
          {$t('game.rematch')}
        </Button>
      {/if}
    </Card.Content>
  </Card.Root>
</div>
