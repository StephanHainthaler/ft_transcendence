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
      console.log(data);
      availableUsers = data;
      const friendData = await client.getFriends();
      friends = friendData.friends;
      selectedUsers = [];
    }
    catch (e: any)
    {
      toast.error(`Failed to load Page Data: ${e.message || e}`)
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
      '1': $t('game.howToPlay'),
      '2': $t('game.howToWin')
  }}
  labelRecords={{
        [$t('game.pointsToWin')]: String(pointsToWin),
        [$t('game.matchDuration')]: `${matchDurationInMinutes} ${$t('game.minutes')}`,
        ...(isAi ? { [$t('game.AIdifficulty')]: AIdifficulty === 1 ? $t('game.easy') : AIdifficulty === 2 ? $t('game.medium') : $t('game.hard') } : {}),
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
        <AiSetup bind:AIdifficulty={AIdifficulty} />
      </div>

      <div class="grid grid-cols-2 gap-4 size-full">
        <UserChallenge users={availableUsers} friends={friends} userSelectionCallback={toggleUserSelected} />
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
      <div class='flex w-full justify-end'>
        <Button size='lg' onclick={finishSetup}>
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
            <Grid title={$t("tournament.nextMatch", 'nextMatch')}>
              <MatchPlayersDisplay game={nextGame} />
            </Grid>
          {/if}
        {/snippet}
        {#snippet actions()}
          <Button size="sm" onclick={ async () => await returnToChallengePage() }>{$t('game.return')}</Button>

          {#if tournament.isDone()}
            <Button size="sm" onclick={ finishTournament }>{$t('tournament.finish', "Finish")}</Button>
          {:else}
            <Button size="sm" onclick={ startNextMatch }>{$t('game.nextMatch', "Next Match")}</Button>
          {/if}
        {/snippet}
      </MatchResult>
    {:else if gameState === 'finished' && winner}
      <h1>{$t('tournament.finished', "Tournemnt Finished")}</h1>
      <p>{$t('tournament.winnerAnnounce', "And the winner is...")}</p>
      <p>{winner.name}</p>
      <Button size="sm" onclick={ async () => await returnToChallengePage() }>{$t('game.return')}</Button>
    {/if}
  </Card.Content>
</Card.Root>
