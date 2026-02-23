<script lang="ts">
  import Grid from "@lib/components/custom/Grid.svelte";
  import { client } from "@lib/api/index.svelte";
  import GridCard from "@lib/components/custom/GridCard.svelte";
  import * as Card from "$lib/components/ui/card";
  import Button from "@lib/components/ui/button/button.svelte";
  import { AppUser, type Game } from "@shared/user";
  import { Tournament } from "@lib/tournament/tournament.svelte";
  import { toast } from 'svelte-sonner';
  import { tick } from 'svelte';
  import { t } from "@lib/i18n/i18n";
  import RulesSetup from "@lib/components/game/RulesSetup.svelte";
  import AiSetup from "@lib/components/game/AiSetup.svelte";
  import PongGame from "@lib/components/game/PongGame.svelte";
  import MatchResult from "@lib/components/game/MatchResult.svelte";
  import type { MatchSubmissionData } from "@shared/game_stats";
  import MatchStartDialog from "@lib/components/game/MatchStartDialog.svelte";
  import MatchPlayersDisplay from "@lib/components/game/MatchPlayersDisplay.svelte";
  import UserChallenge from "@lib/components/game/UserChallenge.svelte";
  import NeonHeader from "@lib/components/custom/NeonHeader.svelte";
  import { isAppError } from "@lib/types/error";
    import { Users } from "lucide-svelte";

  let availableUsers: AppUser[] = $state([]);
  let selectedUsers: AppUser[] = $state([]);
  let friends: AppUser[] = $state([]);

  let matchData: MatchSubmissionData | null = $state(null);
  let pointsToWin = $state(10);
  let matchDurationInMinutes = $state(5);
  let AIdifficulty = $state(2);
  let tournament = new Tournament();

  let nextGame: Game | undefined = $state();
  let currentGame: Game | undefined = $state();

  let dialogOpen = $state(false);
  let gameState: 'setup' | 'running' | 'result' | 'finished' = $state('setup');
  let isAi = $state(false);

  let winner: AppUser | undefined = $state();

  const toggleUserSelected = (user: AppUser) => {
    if (availableUsers.some(u => u.id === user.id)) {
      availableUsers = availableUsers.filter(u => u.id !== user.id);
      selectedUsers = [...selectedUsers, user];
    } else if (selectedUsers.some(u => u.id === user.id)) {
      selectedUsers = selectedUsers.filter(u => u.id !== user.id);
      if (user.id !== 0) {
        availableUsers = [...availableUsers, user];
      }
    }
  }

  const finishTournament = async () => {
    gameState = 'finished';
    winner = tournament.finish();
  }

  const finishSetup = () => {
    if (selectedUsers.length === 0) {
      toast.error($t('tournament.inval_user_count', 'Invalid player count!'), {
        description: $t('tournament.description', 'Please select at least one participants.')
      });
    } else {
      tournament.setPlayers([...selectedUsers])
      dialogOpen = true;
    }
  }

  const startTournament = () => {
    currentGame = tournament.nextGame();
    dialogOpen = false;
    gameState = 'running';
  }

  const loadPageData = async () =>
  {
    await tick();
    try
    {
      const data = await client.getUsers();
      availableUsers = data;
      const friendData = await client.getFriends();
      friends = friendData.friends;
      selectedUsers = [];
    }
    catch (e: any)
    {
      if (isAppError(e)) {
        toast.error(e.message, {
          description: e.description || $t('tournament.load_err_desc', 'Failed to load users for tournament. Please try again later.')
        });
      } else {
        toast.error($t('tournament.failed', 'Failed to load Page Data'));
      }
    }
  }

  const onGameEnd = async (data: MatchSubmissionData)  =>
  {
    gameState = 'result';
    matchData = data;

    tournament.registerWin(data);
    if (!tournament.isDone()) {
      nextGame = tournament.nextGame();
    } else {
      nextGame = undefined;
    }

    if (data.player_one_id !== data.player_two_id) {
      try {
        await client.sendMatchResults(data);
      } catch (e: any) {
        console.error("GameEnd Error:", e.message);
        toast.error($t('game.failSubmit', `Failed to save match results: ${e.message || e}`));
      }
    }
  };

  async function returnToChallengePage()
  {
    await loadPageData();
    gameState = 'setup'
  };

  async function startNextMatch()
  {
    gameState = 'running';
    currentGame = nextGame;
    await tick();
  };

  loadPageData();

</script>

<MatchStartDialog
  bind:dialogOpen={dialogOpen}
  paragraphRecords={{
      '1': $t('game.howToPlay', 'How to play'),
      '2': $t('game.howToWin', 'How to win')
  }}
  labelRecords={{
        [$t('game.pointsToWin', 'Points to Win')]: String(pointsToWin),
        [$t('game.matchDuration', 'Match Duration')]: `${matchDurationInMinutes} ${$t('game.minutes', 'minutes')}`,
        ...(isAi ? { [$t('game.AIdifficulty', 'AI Difficulty')]: AIdifficulty === 1 ? $t('game.easy', 'Easy') : AIdifficulty === 2 ? $t('game.medium', 'Medium') : $t('game.hard', 'Hard') } : {}),
  }}
  confirmCallBack={startTournament}
  >
  {#snippet tournamentParticipents()}
  <Grid title={$t('tournament.schedule', 'Schedule')}>
      {#snippet children()}
        {#each tournament.getSchedule() as game}
          <MatchPlayersDisplay {game} />
        {/each}
        {/snippet}
    </Grid>
  {/snippet}
</MatchStartDialog>

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
            page="tournament"
            players=0/>
      </div>

      <div class="grid grid-cols-2 gap-4 size-full">
        <UserChallenge 
          users={availableUsers} 
          friends={friends} 
          userSelectionCallback={toggleUserSelected} 
        />
        
        <Grid title="">
          <div class="-mt-8 mb-10">
            <NeonHeader
              text={$t('tournament.selected', 'Selected Players')}
              size="x1" 
              level="h1" 
            />
          </div>

          <div class="flex flex-col gap-2">
            {#each selectedUsers as u}
              <GridCard
                title={u.name}
                callback={() => toggleUserSelected(u)}
                buttonDesc={$t('tournament.remove', 'Remove')}
              />
            {:else}
            <div class="flex flex-col items-center justify-center h-32 text-muted-foreground border border-dashed rounded-lg gap-2">
              <Users size={24} strokeWidth={1.5} />
              <p class="text-sm justify-center overflow-hidden">{$t('game.no_chosen_users', 'No chosen users')}</p>
            </div>
            {/each}
          </div>
        </Grid>
      </div>

      <div class='flex w-full justify-end pt-4'>
        <Button class="flex items-center justify-center w-full md:w-auto px-12 uppercase font-bold"
          onclick={finishSetup}>
            {$t('tournament.start', 'Start Tournament')}
        </Button>
      </div>

    {:else if gameState === 'running' && currentGame}
      {#key gameState}
      <PongGame
          player1={currentGame.player1}
          player2={currentGame.player2}
          onGameEnd={async (d) => await onGameEnd(d)}
          {matchDurationInMinutes}
          {pointsToWin}
          {AIdifficulty}
        />
      {/key}
    {:else if gameState === 'result' && currentGame}

      <MatchResult
        matchData={matchData}
        challengedUser={currentGame.player1}
        challengingUser={currentGame.player2}
      >
      {#snippet nextMatch()}
          {#if nextGame}
            <Grid title={$t("tournament.nextMatch", 'Next Match')}>
              <MatchPlayersDisplay game={nextGame} />
            </Grid>
          {/if}
        {/snippet}
        {#snippet actions()}
          <Button size="sm" onclick={ async () => await returnToChallengePage() }>{$t('game.return', 'Return')}</Button>

          {#if tournament.isDone()}
            <Button size="sm" onclick={ finishTournament }>{$t('tournament.finish', "Finish")}</Button>
          {:else}
            <Button size="sm" onclick={ startNextMatch }>{$t('game.nextMatch', "Next Match")}</Button>
          {/if}
        {/snippet}
      </MatchResult>
    {:else if gameState === 'finished' && winner}
      <div class="flex flex-col items-center justify-center size-full gap-4">
        <h1 class="text-4xl font-bold">{$t('tournament.finished', "Tournament Finished")}</h1>
        <p class="text-xl">{$t('tournament.winnerAnnounce', "And the winner is...")}</p>
        <div class="text-3xl text-cyan-400 font-bold">{winner.name}</div>
        <Button size="sm" class="mt-8" onclick={ async () => await returnToChallengePage() }>{$t('game.return', 'Return')}</Button>
      </div>
    {/if}
  </Card.Content>
</Card.Root>