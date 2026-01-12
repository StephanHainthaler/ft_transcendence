<script lang="ts">
  import { onMount } from 'svelte';
  import { client } from "@lib/api/index";
  import type { UserStats, MatchHistoryEntry } from "@shared/game_stats";
  import * as Card from "$lib/components/ui/card";
  import { Button } from "$lib/components/ui/button";

  // Page state
  let stats = $state<UserStats | null>(null);
  let history = $state<MatchHistoryEntry[]>([]);
  let isLoading = $state(true);
  let currentPage = $state(1);

  async function loadData(page: number = 1) {
    try {
      isLoading = true;
      const userId = client.user?.id || 0;

      // Using your ApiClient
      const [s, h] = await Promise.all([
        client.getUserStats(userId),
        client.getMatchHistory(userId, page)
      ]);

      stats = s;
      history = h;
      currentPage = page;
    } catch (error) {
      console.error("Failed to load stats:", error);
    } finally {
      isLoading = false;
    }
  }

  onMount(() => loadData());
</script>

<div class="p-6 max-w-4xl mx-auto">
  <h1 class="text-3xl font-bold mb-6">Player Statistics</h1>

  {#if isLoading}
    <div class="text-center py-10">Loading...</div>
  {:else}
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
      <Card.Root>
        <Card.Header>
          <Card.Title class="text-sm opacity-70">Your Rank</Card.Title>
        </Card.Header>
        <Card.Content>
          <span class="text-4xl font-bold font-mono">{stats?.rank ?? 0}</span>
        </Card.Content>
      </Card.Root>

      <Card.Root>
        <Card.Header>
          <Card.Title class="text-sm opacity-70 uppercase">Wins</Card.Title>
        </Card.Header>
        <Card.Content>
          <span class="text-4xl font-bold text-green-600">{stats?.wins ?? 0}</span>
        </Card.Content>
      </Card.Root>
    </div>

    <h2 class="text-xl font-bold mb-4">Match History</h2>
    <div class="rounded-md border overflow-hidden">
      <table class="w-full text-left border-collapse">
        <thead class="bg-teal-700 text-white">
          <tr>
            <th class="p-3">Opponent</th>
            <th class="p-3 text-center">Score</th>
            <th class="p-3 text-right">Result</th>
          </tr>
        </thead>
        <tbody>
          {#each history as match}
            {@const isWin = match.winner_id === client.user?.id}
            <tr class="border-b hover:bg-gray-50 transition-colors">
              <td class="p-3">Player #{match.opponent_id}</td>
              <td class="p-3 text-center font-mono">{match.p1_score} : {match.p2_score}</td>
              <td class="p-3 text-right font-bold {isWin ? 'text-green-600' : 'text-red-600'}">
                {isWin ? 'WIN' : 'LOSS'}
              </td>
            </tr>
          {:else}
            <tr>
              <td colspan="3" class="p-10 text-center text-gray-400 italic">No matches found</td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>

    <div class="flex justify-center items-center mt-6 gap-4">
      <Button 
        variant="outline" 
        disabled={currentPage <= 1} 
        onclick={() => loadData(currentPage - 1)}>
        ← Previous
      </Button>
      
      <span class="font-mono bg-gray-100 px-3 py-1 rounded">Page {currentPage}</span>
      
      <Button 
        variant="outline" 
        onclick={() => loadData(currentPage + 1)}>
        Next →
      </Button>
    </div>
  {/if}
</div>