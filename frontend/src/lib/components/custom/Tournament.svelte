<script lang="ts">
  import type { AppUser } from "@lib/api/appUser";
  import { Tournament } from "@lib/tournament/tournament";
  import type { Game } from "@shared/user";
  import PongGame from "./PongGame.svelte";
  import Alert from "../ui/alert/alert.svelte";
  import AlertDescription from "../ui/alert/alert-description.svelte";
  import Button from "../ui/button/button.svelte";
  import { onMount } from "svelte";

  const { players }: { players: AppUser[] } = $props();

  let tournament: Tournament = $state(new Tournament());
  let currentGame = $state<{ player1: AppUser, player2: AppUser } | null>(null);

  let schedule: Game[] = $state([]);

  let error: string | null = $state(null)
  let winner: string | null = $state(null);

  onMount(() => {
    tournament.setPlayers(players);
    schedule = tournament.getSchedule();
  })

  const startNextGame = () => {
    const game = schedule.shift();

    if (!game) {
      if (tournament.isDone()) {
        winner = tournament.nextPlayers[0].name;
        return;
      }
      tournament.nextRound();
      schedule = tournament.getSchedule()
      startNextGame();
      return ;
    }

    const player1 = players.find((p) => p.id === game.player1);
    const player2 = players.find((p) => p.id === game.player2);

    if (!player1) throw new Error(`Invalid Player id: ${game.player1}`);
    if (!player2) throw new Error(`Invalid Player id: ${game.player2}`);
    console.log(`Next up: ${player1.name} vs. ${player2.name}`);
    currentGame = { player1, player2 };
  }

  const onGameEnd = (game: Game) => {
    const winner = game.score1 > game.score2 ? game.player1 : game.player2;
    tournament.registerWin(winner);
    console.log('winner: ', players.find(p => p.id === winner)!.name)
    currentGame = null;
    startNextGame();
  }

</script>

{#if currentGame}
  <PongGame
    player1={currentGame.player1}
    player2={currentGame.player2}
    {onGameEnd}
  />
{:else if error}
  <Alert>
    <AlertDescription>{error}</AlertDescription>
  </Alert>
{:else if winner}
  <Alert>
    <AlertDescription>And the Winner is... {winner}</AlertDescription>
  </Alert>
{:else}
  <Button
    onclick={() => { startNextGame() }}
  >
    Next
  </Button>
{/if}
