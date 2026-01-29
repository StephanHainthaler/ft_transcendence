<script lang="ts">
  import { Pong } from "@lib/game/pong";
  import { AppUser } from "$lib/api/appUser";
  import Button from "../ui/button/button.svelte";
  import type { Game } from "@shared/user";

  const { player1, player2, onGameEnd }: { player1: AppUser, player2: AppUser, onGameEnd: (game: Game) => void } = $props();

  let gameCanvas: HTMLCanvasElement | undefined = undefined;
  let pong: Pong;


  $effect(() => {
    if (gameCanvas) {
      pong = new Pong(player1.displayName ?? player1.name, player2.displayName ?? player2.name, gameCanvas);
      // return () => pong.stop()
      pong.setup();
    }
  })

  const reportScore = () => {
    const game: Game = {
      id: 0,
      player1: player1.id,
      player2: player2.id,
      score1: 0,
      score2: 1,
    }
    onGameEnd(game);
  }

</script>

<div>
  <p>{player1.name}</p>
  <p>{player2.name}</p>
</div>

<canvas tabindex="-1" class="bg-black size-full" bind:this={gameCanvas}></canvas>

<Button
  onclick={reportScore}
>
  End
</Button>
