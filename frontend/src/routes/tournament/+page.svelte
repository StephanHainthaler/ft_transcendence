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
    import { isAppError } from "../../lib/types/error";
    import NeonHeader from "@lib/components/custom/NeonHeader.svelte";

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
      if (!availableUsers || availableUsers.length === 0) {
        throw Object.assign(new Error($t('tournament.no_users', 'No users found!')), {isAppError: true}, {
          description: $t('tournament.no_users_desc', 'There are no other users to challenge. Invite your friends to play!')
        });
      }
      // filter out current user
      if (client.user)
        availableUsers = availableUsers.filter((u) => u.id !== client.user!.id);
    }
    catch (e: any)
    {
      if (isAppError(e)) {
        toast.error(e.message, {
          description: e.description || $t('tournament.load_err_desc', 'Failed to load users for tournament. Please try again later.')
        });
      } else {
        toast.error($t(tournament.failed, 'Failed to load Page Data'));
      }
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
      '1': $t('game.howToPlay', 'How to Play: Reflect the ball past your opponent. Left player: W/S, Right player: Up/Down arrows.'),
      '2': $t('game.howToWin', 'How to Win: Be the first to reach the point limit or have more points when time runs out!')
  }}
  labelRecords={{
        [$t('game.leftPlayer', 'Left Player')]: client.user!.name,
        [$t('game.rightPlayer', 'Right Player')]: isAi ? $t('game.aiOpponent', 'AI Opponent') : challengedUser.name,
        [$t('game.pointsToWin', 'Points to Win')]: String(pointsToWin),
        [$t('game.matchDuration', 'Match Duration')]: `${matchDurationInMinutes} ${$t('game.minutes', 'minutes')}`,
        ...(isAi ? { [$t('game.AIdifficulty', 'AI Difficulty')]: AIdifficulty === 1 ? $t('game.easy', 'Easy') : AIdifficulty === 2 ? $t('game.medium', 'Medium') : $t('game.hard', 'Hard') } : {}),
  }}
  confirmCallBack={async () => await challengeUser(challengedUser)}
/>

<div class="flex flex-col h-full min-h-[90vh] bg-card/50 border border-border rounded-xl p-6 shadow-2xl overflow-hidden">
<Card.Root class="h-full border-none bg-transparent shadow-none">
  <Card.Content class="flex flex-col h-full p-4 gap-6">
    {#if gameState === 'setup'}

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 shrink-0">
        <RulesSetup
          bind:matchDurationInMinutes={matchDurationInMinutes}
          bind:pointsToWin={pointsToWin}
        />

        <AiSetup bind:AIdifficulty={AIdifficulty}>
          {#snippet button()}
            <div class="mt-4 w-full flex justify-center">
              <Button 
                class="w-full transition-all duration-300 uppercase font-black text-xs sm:text-sm"
                onclick={challengeAICallback}>
                {$t('game.challengeAI', 'Challenge AI')}
              </Button>
            </div>
          {/snippet}
        </AiSetup>
      </div>

      <div class="grid grid-cols-2 gap-4 size-full">
        <Grid title="">
          <div class="-mt-8 mb-4">
            <NeonHeader
              text={$t('tournament.available', 'Available Players')}
              size="x1" 
              level="h1" 
            />
          </div>
          {#each availableUsers as u}
            <GridCard title={u.name} avatarUrl={u.avatarUrl ?? undefined} callback={() => toggleUserSelected(u)}/>
          {/each}
        </Grid>
        <Grid title="">
          <div class="-mt-8 mb-4">
            <NeonHeader
              text={$t('tournament.selected', 'Selected Players')}
              size="x1" 
              level="h1" 
            />
          </div>
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
        <Button class="w-full transition-all duration-300 uppercase font-black text-xs sm:text-sm">
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
          <Button size="sm" onclick={ returnToChallengePage }>{$t('game.return', 'Return to Challenge Page')}</Button>
          <Button size="sm" onclick={ startNextMatch }>{$t('game.rematch', 'Rematch')}</Button>
        {/snippet}
      </MatchResult>

    {/if}
  </Card.Content>
</Card.Root>
</div>
