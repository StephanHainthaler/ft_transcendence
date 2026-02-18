<script lang="ts">
  import type { AppUser } from "@lib/api/appUser";
  import { Tournament } from "@lib/tournament/tournament";
  import type { Game } from "@shared/user";
  import PongGame from "./PongGame.svelte";
  import Alert from "../ui/alert/alert.svelte";
  import AlertDescription from "../ui/alert/alert-description.svelte";
  import Button from "../ui/button/button.svelte";
  import { onMount } from "svelte";
  import { t } from "@lib/i18n/i18n";

  const { players }: { players: AppUser[] } = $props();

  let tournament: Tournament = $state(new Tournament());
  let currentGame = $state<{ player1: AppUser, player2: AppUser } | null>(null);

  let schedule: Game[] = $state([]);

  let error: string | null = $state(null)
  let winner: string | null = $state(null);

  onMount(() => {
    try {
      tournament.setPlayers(players);
      schedule = tournament.getSchedule();
    } catch (e: any) {
      error = e.message || "Failed to initialize tournament";
    }
  })

  const startNextGame = () => {
    const game = schedule.shift();

    if (!game) {
      if (tournament.isDone()) {
        winner = tournament.nextPlayers[0].name;
        return;
      }
      tournament.nextRound();
      schedule = tournament.getSchedule();
      startNextGame();
      return;
    }

    const player1 = players.find((p) => p.id === game.player1);
    const player2 = players.find((p) => p.id === game.player2);

    if (!player1 || !player2) {
        error = $t('error.user_not_found', 'One of the players was not found.');
        return;
    }
    
    console.log(`Next up: ${player1.name} vs. ${player2.name}`);
    currentGame = { player1, player2 };
  }

  const onGameEnd = (game: Game) => {
    const gameWinnerId = game.score1 > game.score2 ? game.player1 : game.player2;
    tournament.registerWin(gameWinnerId);
    currentGame = null;
    // Автоматично не запускаємо, щоб дати юзеру натиснути "Next" між матчами
  }

</script>

<div class="flex flex-col items-center justify-center gap-6 h-full w-full">
  {#if currentGame}
    <PongGame
      player1={currentGame.player1}
      player2={currentGame.player2}
      {onGameEnd}
    />
  {:else if error}
    <Alert variant="destructive" class="max-w-md">
      <AlertDescription>
        {$t('error.general', 'Something went wrong')}: {error}
      </AlertDescription>
    </Alert>
  {:else if winner}
    <div class="text-center space-y-4">
        <h2 class="text-4xl font-bold animate-bounce text-yellow-500">🏆</h2>
        <Alert class="border-yellow-500 bg-yellow-500/10">
          <AlertDescription class="text-xl font-semibold text-white">
            {$t('tournament.winn_is', 'And the Winner is...')} {winner}
          </AlertDescription>
        </Alert>
        <Button variant="outline" onclick={() => window.location.reload()}>
            {$t('game.return', 'Return to Challenge Page')}
        </Button>
    </div>
  {:else}
    <div class="flex flex-col items-center gap-4">
        <h3 class="text-2xl font-medium text-white">
            {$t('tournament.tournament', 'Tournament Mode')}
        </h3>
        <p class="text-zinc-400">
            {schedule.length > 0 
                ? $t('game.rulesDescription', 'The next match is ready.') 
                : $t('tournament.start', 'Press the button to begin.')}
        </p>
        <Button
          size="lg"
          class="min-w-[200px] text-lg"
          onclick={() => { startNextGame() }}
        >
          {$t('buttons.next', 'Next Match')}
        </Button>
    </div>
  {/if}
</div>