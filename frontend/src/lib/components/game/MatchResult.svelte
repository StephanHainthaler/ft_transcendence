<script lang="ts">
  import type { AppUser } from "@lib/api/appUser";
  import * as Card from "@lib/components/ui/card";
  import { t } from "@lib/i18n/i18n";
  import type { MatchSubmissionData } from "@shared/game_stats";
  import type { Snippet } from "svelte";

  const {
    matchData,
    challengedUser,
    challengingUser,
    actions,
  }: {
    matchData: MatchSubmissionData | null,
    challengedUser: AppUser,
    challengingUser: AppUser,
    actions: Snippet
  } = $props();

  function formatDuration(durationMs: number) {
    const totalSeconds = Math.floor(durationMs / 1000);
    return `${Math.floor(totalSeconds / 60)}:${(totalSeconds % 60).toString().padStart(2, '0')}`;
  }

</script>

<Card.Root class="flex-1 min-h-0 flex flex-col">
  <Card.Header>
    <Card.Title class="text-white text-center text-2xl md:text-3xl font-extrabold uppercase drop-shadow-[0_0_10px_var(--my-primary)]">{$t('game.summary')}</Card.Title>
  </Card.Header>
  <Card.Content class="flex-1 min-h-0 overflow-hidden">
    {#if matchData}
      <div class="w-full flex justify-center mt-2">
        <table class="w-full text-center text-lg max-w-xl border-collapse mx-auto">
          <colgroup>
            <col style="width:50%;"/>
          </colgroup>
          <tbody>
            <tr>
              <td class={matchData.winner_id === matchData.player_one_id ? "text-green-700 text-center text-2xl md:text-3xl font-extrabold p-3" : "text-red-700 text-center text-2xl md:text-3xl font-extrabold p-3"}>
                {matchData.winner_id === matchData.player_one_id ? $t('game.win') : $t('game.lose')}
              </td>
              <td class={matchData.winner_id === matchData.player_one_id ? "text-red-700 text-center text-2xl md:text-3xl font-extrabold p-3" : "text-green-700 text-center text-2xl md:text-3xl font-extrabold p-3"}>
                {matchData.winner_id === matchData.player_one_id ? $t('game.lose') : $t('game.win')}
              </td>
            </tr>
            <tr>
              <th class="text-white text-center text-xl font-semibold p-3">{matchData.player_one_id === 0 ? $t('game.aiOpponent') : challengingUser.name}</th>
              <th class="text-white text-center text-xl font-semibold p-3 ">{matchData.player_two_id === 0 ? $t('game.aiOpponent') : challengedUser.name}</th>
            </tr>
            <tr>
              <td class="text-white text-center text-2xl font-bold p-3">{matchData.p1_score}</td>
              <td class="text-white text-center text-2xl font-bold p-3">{matchData.p2_score}</td>
            </tr>
            <tr>
              <td class="text-gray-600 text-center text-base md:text-lg lg:text-xl font-semibold p-3" colspan="2">
                {$t('game.matchDuration')}: {formatDuration(matchData.duration ?? 0)}
              </td>
            </tr>
          </tbody>
        </table>
        <style>
          table { border: 1px solid #e5e7eb; border-collapse: collapse; }
          td, th { padding: 0.75rem; }
          td:first-child, th:first-child { border-right: 1px solid #e5e7eb; }
          tbody tr:nth-last-child(2) td { border-bottom: 1px solid #e5e7eb; }
        </style>
      </div>
    {:else}
      <p>{$t('game.noMatchData')}</p>
    {/if}
    <div class="w-full flex justify-center gap-4 mt-3">
      {@render actions()}
    </div>
  </Card.Content>
</Card.Root>
