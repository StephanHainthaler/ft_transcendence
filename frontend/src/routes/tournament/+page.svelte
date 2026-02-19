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
  import RulesSetup from "@lib/components/game/RulesSetup.svelte";
  import AiSetup from "@lib/components/game/AiSetup.svelte";
  import MatchStartDialog from "@lib/components/game/MatchStartDialog.svelte";
  import MatchResult from "@lib/components/game/MatchResult.svelte";
  import { aiUser } from "@lib/game";
  import PongGame from "@lib/components/game/PongGame.svelte";
  import { Tournament } from "@lib/tournament/tournament";

  let availableUsers: AppUser[] = $state([]);
  let selectedUsers: AppUser[] = $state([]);

  let canvas: HTMLCanvasElement | null = $state(null);
  let pong: Pong | null = $state(null);
  let matchData: MatchSubmissionData | null = $state(null);
  let challengingUser = $state({} as AppUser);
  let challengedUser = $state({} as AppUser);
  let pointsToWin = $state(10);
  let matchDurationInMinutes = $state(5);
  let AIdifficulty = $state(2);
  let tournament = new Tournament();

  let dialogOpen = $state(false);
  let gameState: 'setup' | 'running' | 'result' = $state('setup');
  let isAi = $state(false);

  const toggleUserSelected = (user: AppUser) => {
    if (availableUsers.some(u => u.id === user.id)) {
      availableUsers = availableUsers.filter(u => u.id !== user.id);
      selectedUsers = [...selectedUsers, user];
    } else if (selectedUsers.some(u => u.id === user.id)) {
      selectedUsers = selectedUsers.filter(u => u.id !== user.id);
      availableUsers = [...availableUsers, user];
    }
  }

  const startTournament = () => {
    // Додаємо дефолтні повідомлення для тостів
    if (selectedUsers.length % 2 !== 0) {
      toast.error($t('tournament.inval_user_count', 'Invalid player count!'), {
        description: $t('tournament.description', 'Please select an even number of participants.')
      });
    } else if (selectedUsers.length === 0) {
      toast.error($t('tournament.inval_user_count', 'Invalid player count!'), {
        description: $t('tournament.description', 'Please select at least two participants.')
      });
    } else {
      tournament.setPlayers(selectedUsers)
      gameState = 'running';
    }
  }

  const loadPageData = async () =>
  {
    await tick();
    try
    {
      const data = await client.getUsers();
      console.log(data);
      availableUsers = data;

      // filter out current user
      if (client.user)
        availableUsers = availableUsers.filter((u) => u.id !== client.user!.id);

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

  async function startNextMatch()
  {
    if (pong)
    {
      gameState = 'running';
      await tick();
      pong.resetMatch(canvas!);
    }
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

      <div class="grid grid-cols-2 gap-4 size-full">
        <Grid title={$t('tournament.available', 'Available Players')}>
          {#each availableUsers as u}
            <GridCard title={u.name} avatarUrl={u.avatarUrl ?? undefined} callback={() => toggleUserSelected(u)}/>
          {/each}
        </Grid>
        <Grid title={$t('tournament.selected', 'Selected Players')}>
          {#each selectedUsers as u}
            <GridCard 
                title={u.name} 
                callback={() => toggleUserSelected(u)} 
                buttonDesc={$t('tournament.remove', 'Remove')} 
            />
          {/each}
        </Grid>
      </div>
      <div class="w-full flex justify-end">
        <Button>
          {$t('game.startTournament', 'Start Tournament')}
        </Button>
      </div>

    {:else if gameState === 'running'}
      <PongGame player1={tournament.players[0]} player2={tournament.players[1]} {onGameEnd} {matchDurationInMinutes} {pointsToWin} {AIdifficulty}/>
    {:else if gameState === 'result'}

      <MatchResult
        matchData={matchData}
        {challengedUser}
        {challengingUser}
      >
        {#snippet actions()}
          <Button size="sm" onclick={ returnToChallengePage }>{$t('game.return')}</Button>
          <Button size="sm" onclick={ startNextMatch }>{$t('game.rematch')}</Button>
        {/snippet}
      </MatchResult>

    {/if}
  </Card.Content>
</Card.Root>
