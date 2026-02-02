<script lang="ts">
  import { onMount } from 'svelte';
  import { client } from "@lib/api/index.svelte";
  import type { UserStats, MatchHistoryEntry } from "@shared/game_stats";
  import * as Card from "$lib/components/ui/card";
  import { Button } from "$lib/components/ui/button";
  import {t} from "@lib/i18n/i18n";

  // Page state
  let stats = $state<UserStats | null>(null);
  let history = $state<MatchHistoryEntry[]>([]);
  let leaderboard = $state<UserStats[]>([]);
  let activeTab = $state('stats');
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
  //     if (activeTab === 'leaderboard')
  //     {
  //       const l = await client.getLeaderboard(page);
  //       leaderboard = l;
  //       currentPage = page;
  //     }
  //     else 
  //     {
  //       const [s, h] = await Promise.all([
  //         client.getUserStats(userId),
  //         client.getMatchHistory(userId, page)
  //       ]);
  //       history = h;
  //       stats = s;
  //       currentPage = page;
  //     }
  //   } catch (error)
  //   {
  //     console.error("Failed to load stats:", error);
  //   } finally
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

        leaderboard = [
          { user_id: 10, rank: 1, wins: 100, losses: 5, total_points: 5000, streak: 10, highest_score: 11 },
          { user_id: 2, rank: 2, wins: 85, losses: 12, total_points: 4200, streak: 3, highest_score: 11 },
          { user_id: 42, rank: 3, wins: 70, losses: 20, total_points: 3500, streak: 0, highest_score: 11 },
          { user_id: 5, rank: 4, wins: 50, losses: 15, total_points: 2800, streak: 1, highest_score: 11 },
          { user_id: 1, rank: 5, wins: 42, losses: 10, total_points: 1540, streak: 5, highest_score: 11 }
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

<div class="flex items-center gap-4 mb-8 justify-center">
  <Button 
    variant="outline" 
    onclick={() => { activeTab = 'stats'; loadData(1); }}
    class="px-6 py-2 rounded-md text-sm font-medium transition-all duration-200 
    {activeTab === 'stats' 
      ? 'bg-slate-700 text-white border-slate-600 shadow-md' 
      : 'bg-slate-900/50 text-slate-400 hover:text-white border-slate-800'}"
  >
    {$t('stats.my_statistics')}
  </Button>

  <Button 
    variant="outline" 
    onclick={() => { activeTab = 'leaderboard'; loadData(1); }}
    class="px-6 py-2 rounded-md text-sm font-medium transition-all duration-200 
    {activeTab === 'leaderboard' 
      ? 'bg-slate-700 text-white border-slate-600 shadow-md' 
      : 'bg-slate-900/50 text-slate-400 hover:text-white border-slate-800'}"
  >
    {$t('stats.leaderboard')}
  </Button>
</div>

<div class="px-4 py-4 sm:p-4 lg:px-6 max-w-6xl mx-auto"> 
  <h1 class="text-3xl font-bold mb-6 text-white">
    {activeTab === 'stats' ? $t('stats.title') : $t('leaderboard.title')}
  </h1>

  {#if isLoading}
    <div class="text-center py-10">{$t('signup.loading')}</div>
  {:else}

    {#if activeTab === 'stats'}
      <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-10">        
        {#each [
          { label: $t('stats.your_rank'), value: stats?.rank },
          { label: $t('stats.wins'), value: stats?.wins },
          { label: $t('stats.losses'), value: stats?.losses },
          { label: $t('stats.total_points'), value: stats?.total_points },
          { label: $t('stats.streak'), value: stats?.streak },
          { label: $t('stats.highest_score'), value: stats?.highest_score }
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

      <h2 class="text-3xl font-bold mb-6 text-white">{$t('stats.match_history')}</h2>
      <div class="rounded-md border border-slate-800 overflow-hidden bg-[#0a0f1a]">
        <table class="w-full text-left border-collapse">
          <thead class="bg-teal-700 text-white text-[12px] uppercase tracking-widest">
            <tr>
              <th class="p-3 w-16 hidden md:table-cell text-center">ID</th>
              
              <th class="p-3 w-32">{$t('stats.opponent')}</th>
              <th class="p-3 text-center w-32">{$t('stats.score')}</th>
              
              <th class="p-3 text-center w-32 hidden md:table-cell">{$t('stats.duration')}</th>
              
              <th class="p-3 pr-6 text-right w-32">{$t('stats.result')}</th>
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
                  <span class="font-bold text-[11px] uppercase">{$t('leaderboard.player_id')} #{opponentId}</span>
                </td>
                
                <td class="p-3 text-center font-mono tracking-tighter">
                  <span class={isWin ? 'text-green-400 font-bold' : ''}>{match.p1_score}</span>
                  <span class="mx-1 opacity-20">:</span>
                  <span class={!isWin && !isDraw ? 'text-red-400 font-bold' : ''}>{match.p2_score}</span>
                </td>

                <td class="p-3 text-center text-xs opacity-80 font-mono hidden md:table-cell">
                  {formatDuration(match.match_duration ?? 0)}
                </td>

                <td class="p-3 pr-5 text-right w-32">
                  <span class="inline-block px-2 py-1 rounded text-[11px] font-black uppercase tracking-tighter
                    {isWin ? 'bg-green-500/10 text-green-500' : 
                    isDraw ? 'bg-slate-500/10 text-slate-400' : 'bg-red-500/10 text-red-500'}">
                    {isWin ? $t('stats.victory') : isDraw ? $t('stats.draw') : $t('stats.defeat')}
                  </span>
                </td>
              </tr>
            {:else}
              <tr>
                <td colspan="5" class="p-12 text-center text-slate-500 italic text-sm tracking-wide bg-slate-900/20">
                  <div class="flex flex-col items-center gap-2">
                    <span class="text-2xl opacity-20">🎮</span>
                    {$t('stats.no_matches')}
                  </div>
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
          ← {$t('buttons.previous')}
        </Button>
        
        <span class="font-mono border border-slate-600 bg-gray-700 px-3 py-1 rounded">{$t('stats.page')} {currentPage}</span>
        
        <Button 
          variant="outline" 
          onclick={() => loadData(currentPage + 1)}>
          {$t('buttons.next')} →
        </Button>
      </div>
    {:else if activeTab === 'leaderboard'}
      <div class="rounded-md border border-slate-800 overflow-hidden bg-[#0a0f1a]">
        <table class="w-full text-left border-collapse">
          <thead class="bg-teal-700 text-white text-[12px] uppercase tracking-widest">
            <tr>
              <th class="p-3 w-16 text-center">{$t('stats.your_rank')}</th>
              <th class="p-3 w-32">{$t('leaderboard.player_id')}</th>
              <th class="p-3 text-center w-32">{$t('stats.wins')}</th>
              <th class="p-3 text-center w-32">{$t('stats.losses')}</th>
              <th class="p-3 text-center w-32">{$t('stats.total_points')}</th>
            </tr>
          </thead>
          <tbody class="text-slate-300">
            {#each leaderboard as player}
              <tr class="border-b border-slate-800 hover:bg-slate-800/40 transition-colors">
                <td class="p-3 text-center font-mono text-[11px] opacity-80">
                  #{player.rank}
                </td>
                <td class="p-3">
                  <span class="font-bold text-[11px] uppercase">{$t('leaderboard.player_id')} #{player.user_id}</span>
                </td>
                <td class="p-3 text-center font-mono">
                  {player.wins}
                </td>
                <td class="p-3 text-center font-mono">
                  {player.losses}
                </td>
                <td class="p-3 text-center font-mono">
                  {player.total_points}
                </td>
              </tr>
            {:else}
              <tr>
                <td colspan="5" class="p-12 text-center text-slate-500 italic text-sm tracking-wide bg-slate-900/20">
                  <div class="flex flex-col items-center gap-2">
                    <span class="text-2xl opacity-20">🏆</span>
                    {$t('leaderboard.no_players')}
                  </div>
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
          ← {$t('buttons.previous')}
        </Button>
        
        <span class="font-mono border border-slate-600 bg-gray-700 px-3 py-1 rounded">{$t('stats.page')} {currentPage}</span>
        
        <Button 
          variant="outline" 
          onclick={() => loadData(currentPage + 1)}>
          {$t('buttons.next')} →
        </Button>
      </div>

     {/if}
  {/if}
</div>
