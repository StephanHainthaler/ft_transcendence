<script lang="ts">
  import { onMount } from 'svelte';
  import { client } from "@lib/api/index.svelte";
  import type { UserStats, MatchHistoryEntry } from "@shared/game_stats";
  import { Button } from "$lib/components/ui/button";
  import { t } from "@lib/i18n/i18n";
  import StatsCard from "$lib/components/custom/StatsCard.svelte";
  import CyberTable from "$lib/components/custom/CyberTable.svelte";
  import ResultBadge from "$lib/components/custom/ResultBadge.svelte";

  let stats = $state<UserStats | null>(null);
  let history = $state<MatchHistoryEntry[]>([]);
  let leaderboard = $state<UserStats[]>([]);
  let activeTab = $state('stats');
  let isLoading = $state(true);
  let currentPage = $state(1);
  let usernames = $state<Record<number, string>>({});

  const historyHeaders = [
    { label: "#ID", class: "w-16 hidden md:table-cell text-center opacity-50" },
    { label: $t('stats.played'), class: "text-center hidden md:table-cell" },
    { label: $t('stats.opponent') },
    { label: $t('stats.score'), class: "text-center" },
    { label: $t('stats.duration'), class: "text-center hidden md:table-cell" },
    { label: $t('stats.result'), class: "text-right pr-8" }
  ];

  function formatDuration(durationMs: number) {
    const totalSeconds = Math.floor(durationMs / 1000);
    return `${Math.floor(totalSeconds / 60)}:${(totalSeconds % 60).toString().padStart(2, '0')}`;
  }

  async function loadData(page: number = 1) {
    try {
      isLoading = true;
      const userId = client.user?.id || 1; 
      await new Promise(r => setTimeout(r, 500));

      stats = { user_id: userId, rank: 12, wins: 42, losses: 10, total_points: 1540, streak: 5, highest_score: 11 };
      // history = undefined;
        history = [
        { match_id: 1, player_one_id: userId, player_two_id: 99, p1_score: 11, p2_score: 5, winner_id: userId, match_duration: 350000, timestamp: 123456789 },
        { match_id: 2, player_one_id: 88, player_two_id: userId, p1_score: 8, p2_score: 11, winner_id: userId, match_duration: 420000, timestamp: 123456789 }
      ];
      leaderboard = [
        { user_id: 1, rank: 1, username: "khukkhukhuku", wins: 100, losses: 5, total_points: 5000, streak: 10, highest_score: 11 },
        { user_id: 1, rank: 1, username: "khuk", wins: 100, losses: 5, total_points: 5000, streak: 10, highest_score: 11 },
        { user_id: 1, rank: 1, username: "khuk", wins: 100, losses: 5, total_points: 5000, streak: 10, highest_score: 11 }
      ];
      currentPage = page;
    } finally {
      isLoading = false;
    }
  }

  onMount(() => loadData());
</script>

<div class="flex items-center gap-4 mb-8 justify-center">
  <Button variant="tab" data-active={activeTab === 'stats'} onclick={() => { activeTab = 'stats'; loadData(1); }}>
    {$t('stats.my_statistics')}
  </Button>
  <Button variant="tab" data-active={activeTab === 'leaderboard'} onclick={() => { activeTab = 'leaderboard'; loadData(1); }}>
    {$t('stats.leaderboard')}
  </Button>
</div>

<div class="px-4 max-w-6xl mx-auto space-y-8"> 
  <h1 class="text-4xl font-black uppercase tracking-tighter text-white drop-shadow-[0_0_10px_var(--my-primary)]">
    {activeTab === 'stats' ? $t('stats.title') : $t('leaderboard.title')}
  </h1>

  {#if isLoading}
  <div class="text-center py-20 font-mono animate-pulse text-primary">_ {$t('stats.loading')}</div>
  {:else}
    {#if activeTab === 'stats'}
      <div class="grid grid-cols-2 sm:grid-cols-6 gap-4">        
        <StatsCard label={$t('stats.your_rank')} value={stats?.rank} />
        <StatsCard label={$t('stats.wins')} value={stats?.wins} />
        <StatsCard label={$t('stats.losses')} value={stats?.losses} />
        <StatsCard label={$t('stats.total_points')} value={stats?.total_points} />
        <StatsCard label={$t('stats.streak')} value={stats?.streak} />
        <StatsCard label={$t('stats.highest_score')} value={stats?.highest_score} />
      </div>

      <h2 class="text-4xl font-black uppercase tracking-tighter text-white drop-shadow-[0_0_10px_var(--my-primary)]">
        {$t('stats.match_history')}
      </h2>

  <CyberTable headers={historyHeaders}>
    {#each history as match}
      {@const userId = client.user?.id || 1}
      {@const isPlayerOne = match.player_one_id === userId}
      {@const opponentId = isPlayerOne ? match.player_two_id : match.player_one_id}
      {@const isWin = match.winner_id === userId}
      {@const isDraw = match.winner_id === null}

      <tr class="group hover:bg-primary/5 transition-all duration-300">
        <td class="p-4 text-center font-mono text-[9px] sm:text-[12px] text-muted-foreground hidden md:table-cell">
          #{match.match_id}
        </td>

        <td class="p-4 text-center font-mono text-[9px] sm:text-[12px] text-white/70">
          {new Date(match.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </td>

        <td class="p-4">
          <span class="font-bold text-xs text-white uppercase tracking-wider">
            {$t('stats.user')} {opponentId}
          </span>
        </td>

        <td class="p-4 text-center font-mono text-lg tracking-widest">
          <span class={isWin ? 'text-primary drop-shadow-[0_0_8px_var(--my-primary)]' : 'text-white/40'}>
            {isPlayerOne ? match.p1_score : match.p2_score}
          </span>
          <span class="mx-2 opacity-20 text-xs">:</span>
          <span class={!isWin && !isDraw ? 'text-destructive' : 'text-white/40'}>
            {isPlayerOne ? match.p2_score : match.p1_score}
          </span>
        </td>

        <td class="p-4 text-center text-[12px] font-mono text-muted-foreground hidden md:table-cell">
          {formatDuration(match.match_duration ?? 0)}
        </td>

        <td class="p-4 text-right pr-8">
          <ResultBadge 
            type={isWin ? 'win' : (isDraw ? 'draw' : 'loss')} 
            label={isWin ? $t('stats.victory') : (isDraw ? $t('stats.draw') : $t('stats.defeat'))} 
          />
        </td>
      </tr>
    {:else}
    <tr>
      <td colspan="6" class="p-12 text-center bg-primary/5 border-t border-border/30">
        <div class="flex flex-col items-center gap-3 animate-pulse">
          <span class="text-4xl opacity-20 filter grayscale">🎮</span>
          <p class="text-muted-foreground font-mono tracking-widest uppercase text-xs">
            {$t('stats.no_matches')}
          </p>
          <div class="w-16 h-[1px] bg-primary/30"></div>
        </div>
      </td>
    </tr>
    {/each}
  </CyberTable>

    {:else if activeTab === 'leaderboard'}
      <CyberTable headers={[
        { label: $t('leaderboard.rank'), class: "w-20 text-center opacity-50" },
        { label: $t('leaderboard.player_id'), class: "text-center hidden md:table-cell" },
        { label: $t('leaderboard.nickname'), class: "text-left min-w-[100px]" },
        { label: $t('leaderboard.games_played'), class: "text-center hidden md:table-cell"},
        { label: $t('stats.wins'), class: "text-center" },
        { label: $t('stats.losses'), class: "text-center" },
        { label: $t('leaderboard.points'), class: "text-right pr-8" }
      ]}>
        {#each leaderboard as player}
          <tr class="group hover:bg-primary/6 transition-all duration-300">
            <td class="p-4 text-center">
              <span class="font-mono text-xl font-black {player.rank <= 3 ? 'text-primary drop-shadow-[0_0_5px_var(--my-primary)]' : 'text-white/20'}">
                #{player.rank}
              </span>
            </td>
            <td class="p-4 hidden md:table-cell">
              <span class="font-bold text-xs text-white uppercase tracking-wider hidden md:table-cell">{$t('stats.user')} {player.user_id}</span>
            </td>
            <td class="p-4 max-w-[100px] md:max-w-[200px]">
              <span class="font-black text-sm text-white uppercase tracking-wider group-hover:text-primary transition-colors block truncate">
                {player.username || 'Unknown_Pilot'}
              </span>
            </td>
            <td class="p-4 text-center font-mono text-white/60 hidden md:table-cell">
              {player.wins + player.losses}
            </td>
            <td class="p-4 text-center font-mono text-white/80">{player.wins}</td>
            <td class="p-4 text-center font-mono text-white/80">{player.losses}</td>
            <td class="p-4 text-right pr-8 font-mono text-primary font-bold">{player.total_points}</td>
          </tr>
        {:else}
        <tr>
          <td colspan="7" class="p-12 text-center bg-primary/5 border-t border-border/30">
            <div class="w-full flex flex-col items-center justify-center gap-3 animate-pulse">
              <span class="text-4xl opacity-20 filter grayscale">🎮</span>
              <p class="text-muted-foreground text-center font-mono tracking-widest uppercase text-xs">
                {$t('stats.no_matches')}
              </p>
              <div class="w-16 h-[1px] bg-primary/30"></div>
            </div>
          </td>
        </tr>
        {/each}
      </CyberTable>
    {/if}

    <div class="flex justify-center items-center mt-10 gap-6">
      <Button variant="tab" size="tab" disabled={currentPage <= 1} onclick={() => loadData(currentPage - 1)}>◂</Button>
      <div class="flex flex-col items-center">
        <span class="text-[10px] uppercase font-black text-muted-foreground">{$t('stats.page')}</span>
        <span class="font-mono text-xl font-bold text-primary">{currentPage.toString().padStart(2, '0')}</span>
      </div>
      <Button variant="tab" size="tab" onclick={() => loadData(currentPage + 1)}>▸</Button>
    </div>
  {/if}
</div>