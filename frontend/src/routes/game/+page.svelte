<script lang="ts">
  import { AppUser } from "@shared/user";
  import { client } from "@lib/api/index.svelte";
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
  import NeonHeader from "@lib/components/custom/NeonHeader.svelte";
  import Grid from "@lib/components/custom/Grid.svelte";
  import UserChallenge from "@lib/components/game/UserChallenge.svelte";
  import GridCard from "@lib/components/custom/GridCard.svelte";
    import { Users } from "lucide-svelte";

  let users: AppUser[] = $state([]);
  let friends: AppUser[] = $state([]);
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
      const friendsData = await client.getFriends();
      users = data;
      if (!users || users.length === 0) {
        throw Object.assign(new Error($t('tournament.no_users', 'No users found!')), {isAppError: true}, {
          description: $t('tournament.no_users_desc', 'There are no other users to challenge. Invite your friends to play!')
        });
      }
      // filter out current user
      if (client.user)
        users = users.filter((u) => u.id !== client.user!.id);

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

  async function startRematch()
  {
    pongRef?.resetPong();
    gameState = 'running';
    await tick();
  };

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

  loadPageData();

  const userSelectionCallback = (u: AppUser) => {
    isAi = false;
    selectUser(u);
  }

  const challengeAICallback = () => {
    isAi = true;
    selectUser(aiUser());
  }

  const selectUser = (u: AppUser) => {
    challengedUser = u;
    dialogOpen = true;
  }

</script>

{#key isAi}
  <MatchStartDialog
    bind:dialogOpen={dialogOpen}
    paragraphRecords={{
      '1': $t('game.howToPlay', 'How to Play: Reflect the ball past your opponent. Left player: W/S, Right player: Up/Down arrows.'),
      '2': $t('game.howToWin', 'How to Win: Be the first to reach the point limit or have more points when time runs out!')
    }}
    labelRecords={{
          [$t('game.pointsToWin', 'Points to Win')]: String(pointsToWin),
          [$t('game.matchDuration', 'Match Duration')]: `${matchDurationInMinutes} ${$t('game.minutes', 'minutes')}`,
          [$t('game.leftPlayer', 'Left Player')]: client.user!.name,
          [$t('game.rightPlayer', 'Right Player')]: isAi ? $t('game.aiOpponent', 'AI Opponent') : challengedUser.name,
          ...(isAi ? { [$t('game.AIdifficulty', 'AI Difficulty')]: AIdifficulty === 1 ? $t('game.easy', 'Easy') : AIdifficulty === 2 ? $t('game.medium', 'Medium') : $t('game.hard', 'Hard') } : {}),
    }}
    confirmCallBack={async () => await challengeUser(challengedUser)}
  />
{/key}

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

      <div class="flex-1 flex flex-col min-h-0">
        <Grid title="">
          <div class="-mt-8 mb-4">
            <NeonHeader
              text={$t('game.to_challenge', 'Challenge AI')}
              size="x1" 
              level="h1" 
            />
          </div>
          <div class="overflow-y-auto h-full pr-2 custom-scrollbar">
            <div class="grid grid-cols-1">
              {#each users as user}
                <GridCard
                  title={user.name} 
                  avatarUrl={user.avatarUrl} 
                  buttonDesc={$t('game.to_challenge', 'Challenge')} 
                  callback={() => userSelectionCallback(user)}
                />
              {:else}
              <div class="flex flex-col items-center justify-center h-32 text-muted-foreground border border-dashed rounded-lg">
                <Users size={24} strokeWidth={1.5} />
                <p class="text-sm">{$t('game.no_users', 'No users available')}</p>
              </div>
              {/each}
            </div>
          </div>
        </Grid>
      </div>

    {:else if gameState === 'running'}
      <div class="flex-1 min-h-0">
        <PongGame 
        bind:this={pongRef}
        player1={challengingUser}
        player2={challengedUser} {onGameEnd}
        {matchDurationInMinutes} {pointsToWin}
        {AIdifficulty}/>
      </div>

    {:else if gameState === 'result'}
      <MatchResult 
        matchData={matchData}
        {challengedUser}
        {challengingUser}
      >
        {#snippet actions()}
          <Button onclick={returnToChallengePage}>{$t('game.return', 'Return to Challenge Page')}</Button>
          <Button onclick={startRematch}>{$t('game.rematch', 'Rematch')}</Button>
        {/snippet}
      </MatchResult>
    {/if}
  </Card.Content>
</Card.Root>
</div>
