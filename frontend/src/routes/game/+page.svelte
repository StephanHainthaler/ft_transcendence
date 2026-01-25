<script lang="ts">
  import { client } from "@lib/api/index";
  import { AppUser } from "@lib/api/appUser";
  import Grid from "@lib/components/custom/Grid.svelte";
  import GridCard from "@lib/components/custom/GridCard.svelte";
  import * as Card from "$lib/components/ui/card";

  import { tick } from 'svelte';
  import { toast } from "svelte-sonner";
  import { t } from "@lib/i18n/i18n";

  import { Pong } from "@lib/game/pong";
  import type { MatchSubmissionData } from "@shared/game_stats";
  // import { recordMatch } from "../../../../services/game_stats/src/logic";

  let users: AppUser[] = $state([]);
  let running = $state(false);
  let showingResultScreen = $state(false);
  let canvas: HTMLCanvasElement | null = $state(null);
  let pong: Pong | null = $state(null);
  let matchData: MatchSubmissionData | null = $state(null);
  let challengingUser = {} as AppUser;
  let challengedUser = {} as AppUser;

  const loadPageData = async () =>
  {
    await tick();
    //await tick();
    try
    {
      const data = await client.getUsers();
      console.log(data);
      users = data;
    }
    catch (e: any)
    {
      toast.error(`Failed to load Page Data: ${e.message || e}`)
    }
  };

  const challengeUser = async (u: AppUser) =>
  {
    running = true;
    showingResultScreen = false;

    await tick();
    console.log(u);
    challengedUser = u;
    if (client.user)
    {
      challengingUser = new AppUser(client.user, null);
      if (canvas)
        pong = new Pong(challengingUser, challengedUser, canvas, onGameEnd);
    }
  };

  const onGameEnd = (data: MatchSubmissionData) =>
  {
    running = false;
    showingResultScreen = true;

    console.log(data);
    matchData = data;

    //// send Data to database
    //recordMatch(matchData);
  };

  function returnToChallengePage() : void
  {
		running = false;
    showingResultScreen = false;
	};

  function startRematch() : void
  {
    if (!pong)
      console.error("Pong instance is null!");
    else
      console.log("Pong instance exists!");
    if (!pong?.getCanvas())
      console.error("Canvas is null!");
    else
      console.log("Canvas exists!");
  
    if (pong && pong.getCanvas())
    {
      running = true;
      showingResultScreen = false;
      pong.resetMatch(pong?.getCanvas());
      //pong = new Pong(challengingUser, challengedUser, canvasElement, onGameEnd);
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
      {#if !running && !showingResultScreen}
        <Grid title={$t('game.challenge')}>
          {#each users as user}
            <GridCard title={user.name} avatarUrl={user.avatarUrl} callback={() => challengeUser(user)} buttonDesc={$t('game.challenge')} />
          {/each}
        </Grid>
      {:else if running && !showingResultScreen}
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
        <button onclick={ returnToChallengePage } class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
          {$t('game.return')}
        </button>
        <button onclick={ startRematch } class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
          {$t('game.rematch')}
        </button>
      {/if}
    </Card.Content>
  </Card.Root>
</div>
