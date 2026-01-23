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
    challengingUser = u;
    if (client.user)
    {
      challengedUser = new AppUser(client.user, null);
      if (canvas)
        pong = new Pong(challengingUser, challengedUser, canvas, onGameEnd);
    }
  };

  const onGameEnd = (data: MatchSubmissionData) =>
  {
    running = false;
    showingResultScreen = true;

    console.log(data);
    console.log(running);
    console.log(showingResultScreen);

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
    pong?.resetMatch();
		running = true;
    showingResultScreen = false;
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
        <h2 class="text-2xl font-bold mb-4">{$t('game.match_result')}</h2>
        {#if matchData}
          <p class="mb-2">{$t('game.winner')}: {matchData.p1_score} ({matchData.p2_score})</p>
          <p class="mb-4">{$t('game.loser')}: {matchData.p2_score} ({matchData.p1_score})</p>
        {/if}
        <button onclick={ returnToChallengePage } class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
          Return to Challenge Page
        </button>
        <button onclick={ startRematch } class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
          Play again
        </button>
      {/if}
    </Card.Content>
  </Card.Root>
</div>
