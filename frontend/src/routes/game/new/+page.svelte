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
  import type { MatchSubmissionData } from "@shared/game_stats";
  import RulesSetup from "@lib/components/game/RulesSetup.svelte";
  import AiSetup from "@lib/components/game/AiSetup.svelte";
  import MatchStartDialog from "@lib/components/game/MatchStartDialog.svelte";
  import MatchResult from "@lib/components/game/MatchResult.svelte";
  import { aiUser } from "@lib/game";
  import PongGame from "@lib/components/game/PongGame.svelte";

  let users: AppUser[] = $state([]);
  let matchData: MatchSubmissionData | null = $state(null);
  let challengingUser = $state({} as AppUser);
  let challengedUser = $state({} as AppUser);
  let pointsToWin = $state(10);
  let matchDurationInMinutes = $state(5);
  let AIdifficulty = $state(2);

  let pongRef: PongGame | undefined = $state(undefined);
  let dialogOpen = $state(false);
  let gameState: 'setup' | 'running' | 'result' = $state('setup');
  let isAi = $state(false);

  const loadPageData = async () =>
  {
    await tick();
    try
    {
      const data = await client.getUsers();
      console.log(data);
      users = data;

      // filter out current user
      if (client.user)
        users = users.filter((u) => u.id !== client.user!.id);

    }
    catch (e: any)
    {
      toast.error(`Failed to load Page Data: ${e.message || e}`)
    }
  }

  const challengeUser = async (selectedUser: AppUser) =>
  {
    if (client.user)
    {
      challengingUser = new AppUser(client.user, null);
      challengedUser = selectedUser;
    }
    gameState = 'running';
    dialogOpen = false;
  };

  const onGameEnd = (data: MatchSubmissionData)  =>
  {
    gameState = 'result';
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
    gameState = 'setup'
  };

  async function startRematch()
  {
    pongRef?.resetPong();
    console.log('rematching')
    gameState = 'running';
    await tick();
  };

  loadPageData();

  const userSelectionCallback = (u: AppUser) => {
    isAi = false;
    challengedUser = u;
    dialogOpen = true;
  }

  const challengeAICallback = () => {
    isAi = true;
    userSelectionCallback(aiUser);
  }

</script>

<MatchStartDialog
  bind:dialogOpen={dialogOpen}
  paragraphRecords={{
      '1': $t('game.howToPlay'),
      '2': $t('game.howToWin')
  }}
  labelRecords={{
        [$t('game.leftPlayer')]: client.user!.name,
        [$t('game.rightPlayer')]: isAi ? $t('game.aiOpponent') : challengedUser.name,
        [$t('game.pointsToWin')]: String(pointsToWin),
        [$t('game.matchDuration')]: `${matchDurationInMinutes} ${$t('game.minutes')}`,
        ...(isAi ? { [$t('game.AIdifficulty')]: AIdifficulty === 1 ? $t('game.easy') : AIdifficulty === 2 ? $t('game.medium') : $t('game.hard') } : {}),
  }}
  confirmCallBack={async () => await challengeUser(challengedUser)}
/>

<Card.Root class="size-full">
  <Card.Content class="flex flex-col gap-4 size-full overflow-hidden">
    {#if gameState === 'setup'}

      <div class="grid grid-cols-2 gap-4 min-h-[30%]">
        <RulesSetup
          bind:matchDurationInMinutes={matchDurationInMinutes}
          bind:pointsToWin={pointsToWin}
        />

        <AiSetup
          bind:AIdifficulty={AIdifficulty}
        >
          {#snippet button()}
            <Button onclick={challengeAICallback}>
              {$t('game.challengeAI')}
            </Button>
          {/snippet}
        </AiSetup>
      </div>

      <div class="col-span-2 size-full">
        <Grid title={$t('game.challenge')}>
          {#each users as user}
            <GridCard title={user.name} avatarUrl={user.avatarUrl} buttonDesc={$t('game.challenge')} callback={() => userSelectionCallback(user)}/>
          {/each}
        </Grid>
      </div>

    {:else if gameState === 'running'}
      <PongGame bind:this={pongRef} player1={challengingUser} player2={challengedUser} {onGameEnd} {matchDurationInMinutes} {pointsToWin} {AIdifficulty}/>
    {:else if gameState === 'result'}

      <MatchResult
        matchData={matchData}
        {challengedUser}
        {challengingUser}
      >
        {#snippet actions()}
          <Button onclick={ returnToChallengePage }>{$t('game.return')}</Button>
          <Button onclick={async () => await startRematch() }>{$t('game.rematch')}</Button>
        {/snippet}
      </MatchResult>

    {/if}
  </Card.Content>
</Card.Root>
