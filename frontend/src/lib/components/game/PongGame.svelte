<script lang="ts">
  import { Pong } from "@lib/game/pong";
  import { AppUser } from "@shared/user";
  import type { MatchSubmissionData } from "@shared/game_stats";
  import { onMount, tick } from "svelte";

  const {
    player1,
    player2,
    pointsToWin,
    matchDurationInMinutes,
    AIdifficulty,
    onGameEnd
  }: {
    player1: AppUser,
    player2: AppUser,
    pointsToWin: number,
    matchDurationInMinutes: number,
    AIdifficulty: number,
    onGameEnd: (data: MatchSubmissionData) => void
  } = $props();

  let gameCanvas: HTMLCanvasElement | undefined = undefined;
  let pong: Pong;

  onMount(async () => {
    await tick();
    if (gameCanvas) {
      gameCanvas.focus();
      pong = new Pong(player1, player2, gameCanvas, pointsToWin, matchDurationInMinutes, AIdifficulty, onGameEnd);
    }
  })

  export const resetPong = () => {
    pong.resetMatch(gameCanvas!);
  }

</script>

<div class="size-full flex flex-col">
  <canvas bind:this={gameCanvas} class='size-full bg-black' tabindex='0'></canvas>
</div>
