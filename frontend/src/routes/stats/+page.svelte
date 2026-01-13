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

  function formatDuration(durationMs: number): string
  {
    const totalSeconds = Math.floor(durationMs / 1000);
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return (`${mins}:${secs.toString().padStart(2, '0')}`);
  }

  // async function loadData(page: number = 1)
  // {
  //   try
  //   {
  //     isLoading = true;
  //     const userId = client.user?.id;
  //     if (!userId)
  //       return;

  //     const [s, h] = await Promise.all([
  //       client.getUserStats(userId),
  //       client.getMatchHistory(userId, page)
  //     ]);

  //     stats = s;
  //     history = h;
  //     currentPage = page;
  //   } catch (error)
  //   {
  //     console.error("Failed to load stats:", error);
  //   }finally
  //   {
  //     isLoading = false;
  //   }
  // }

  //Something for testing without backend
  async function loadData(page: number = 1) {
    try {
      isLoading = true;
      const userId = client.user?.id || 1; 

      await new Promise(resolve => setTimeout(resolve, 500));

      stats = {
        user_id: userId,
        rank: 12,
        wins: 42,
        losses: 10,
        total_points: 1540,
        streak: 5,
        highest_score: 11
      };

      history = [
        { match_id: 1, player_one_id: userId, player_two_id: 99, p1_score: 11, p2_score: 5, winner_id: userId, match_duration: Math.random() * 8000, timestamp: 123456789},
        { match_id: 2, player_one_id: 88, player_two_id: userId, p1_score: 8, p2_score: 11, winner_id: userId, match_duration: Math.random() * 8000, timestamp: 123456789},
        { match_id: 3, player_one_id: userId, player_two_id: 77, p1_score: 2, p2_score: 11, winner_id: 77, match_duration: Math.random() * 8000, timestamp: 123456789},
        { match_id: 4, player_one_id: 66, player_two_id: userId, p1_score: 11, p2_score: 0, winner_id: 66, match_duration: Math.random() * 8000, timestamp: 123456789},
        { match_id: 5, player_one_id: userId, player_two_id: 55, p1_score: 10, p2_score: 10, winner_id: userId, match_duration: Math.random() * 8000, timestamp: 123456789}
      ];

      currentPage = page;
    } catch (error) {
      console.error("Failed to load stats:", error);
    } finally {
      isLoading = false;
    }
  }

  onMount(() => loadData());
</script>

<div class="px-4 py-4 sm:p-4 lg:px-6 max-w-6xl mx-auto"> <h1 class="text-3xl font-bold mb-6 text-white">Player Statistics</h1>

  {#if isLoading}
    <div class="text-center py-10">Loading...</div>
  {:else}
    <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-10">
      
      {#each [
        { label: 'Your Rank', value: stats?.rank },
        { label: 'Wins', value: stats?.wins },
        { label: 'Losses', value: stats?.losses },
        { label: 'Total Points', value: stats?.total_points },
        { label: 'Streak', value: stats?.streak },
        { label: 'Highest Score', value: stats?.highest_score }
      ] as item}
        <Card.Root class="overflow-hidden border-slate-800 bg-slate-900/50">
          <Card.Header class="p-3 pb-0"> 
            <Card.Title class="text-[10px] sm:text-xs opacity-70 uppercase tracking-wider text-slate-400">
              {item.label}
            </Card.Title>
          </Card.Header>
          <Card.Content class="p-3 pt-1">
            <span class="text-xl sm:text-2xl font-black font-mono text-white">
              {item.value ?? 0}
            </span>
          </Card.Content>
        </Card.Root>
      {/each}
      
    </div>



    <h2 class="text-3xl font-bold mb-6 text-white">Match History</h2>
    <div class="rounded-md border border-slate-800 overflow-hidden bg-[#0a0f1a]">
      <table class="w-full text-left border-collapse">
        <thead class="bg-teal-700 text-white text-[12px] uppercase tracking-widest">
          <tr>
            <th class="p-3 w-16 hidden md:table-cell text-center">ID</th>
            
            <th class="p-3 w-32">Opponent</th>
            <th class="p-3 text-center w-32">Score</th>
            
            <th class="p-3 text-center w-32 hidden md:table-cell">Duration</th>
            
            <th class="p-3 pr-6 text-right w-32">Result</th>
          </tr>
        </thead>
        <tbody class="text-slate-300">
          {#each history as match}
            {@const userId = client.user?.id || 1}
            {@const isPlayerOne = match.player_one_id === userId}
            {@const opponentId = isPlayerOne ? match.player_two_id : match.player_one_id}
            {@const isWin = match.winner_id === userId}
            {@const isDraw = match.winner_id === null}

            <tr class="border-b border-slate-800 hover:bg-slate-800/40 transition-colors">
              <td class="p-3 text-center font-mono text-[11px] opacity-80 hidden md:table-cell">
                #{match.match_id}
              </td>
              
              <td class="p-3">
                <span class="font-bold text-[11px] uppercase">Player #{opponentId}</span>
              </td>
              
              <td class="p-3 text-center font-mono tracking-tighter">
                <span class={isWin ? 'text-green-400 font-bold' : ''}>{match.p1_score}</span>
                <span class="mx-1 opacity-20">:</span>
                <span class={!isWin && !isDraw ? 'text-red-400 font-bold' : ''}>{match.p2_score}</span>
              </td>

              <td class="p-3 text-center text-xs opacity-80 font-mono hidden md:table-cell">
                {formatDuration(match.match_duration)}
              </td>

              <td class="p-3 pr-5 text-right w-32">
                <span class="inline-block px-2 py-1 rounded text-[11px] font-black uppercase tracking-tighter
                  {isWin ? 'bg-green-500/10 text-green-500' : 
                  isDraw ? 'bg-slate-500/10 text-slate-400' : 'bg-red-500/10 text-red-500'}">
                  {isWin ? 'Victory' : isDraw ? 'Draw' : 'Defeat'}
                </span>
              </td>
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
      
      <span class="font-mono border border-slate-600 bg-gray-700 px-3 py-1 rounded">Page {currentPage}</span>
      
      <Button 
        variant="outline" 
        onclick={() => loadData(currentPage + 1)}>
        Next →
      </Button>
    </div>
  {/if}
</div>