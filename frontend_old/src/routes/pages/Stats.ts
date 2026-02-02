import { Separator } from "@lib/components/ui/Seperator";
import type { Route } from "@lib/types/route";
import { button, div, form, h1, h2, updateId, span, el, type VNode } from "@lib/vdom";
import { client } from "@lib/api/index.svelte";
import { Layout } from "@lib/components/layout";
import { fetchUserStats, fetchMatchHistory } from "@lib/api/gameStats";
import type { UserStats, MatchHistoryEntry } from "@shared/game_stats";

let stats: UserStats | null = null;
let history: MatchHistoryEntry[] = [];
let isLoggedIn: boolean = true;
let isLoading: boolean = true;
let currentPage: number = 1;

const StatsFormDiv = (): VNode => {
    if (isLoading)
        return (div({id: 'stats-content', class: 'p-10'}, 'Loading...'));

    const s = stats as unknown as Record<string, any>;
    const rank = s?.['rank']?.toString() || '0';
    const wins = s?.['wins']?.toString() || '0';

    return div({ id: 'stats-content', class: 'card' },
        h1({ class: 'title' }, 'Player Statistics'),
        div({ class: 'rank-box' }, 
            span({}, 'Your Rank: '),
            span({ class: 'font-bold' }, rank)
        ),
        div({ class: 'p-3 bg-white/40 rounded' },
            span({ class: 'block text-xs uppercase' }, 'Wins'),
            span({ class: 'text-3xl font-bold' }, wins)
        ),
        // Pagination
        div({ class: 'flex justify-center mt-6 gap-4' },
            button({
                class: `btn-secondary ${currentPage <= 1 ? 'opacity-50 cursor-not-allowed' : ''}`,
                onclick: () => {
                    if (currentPage > 1) loadData(currentPage - 1);
                }
            }, '← Previous'),

            span({ class: 'py-2 px-4 bg-teal-900/20 rounded font-mono' }, `Page ${currentPage}`),

            button({
                class: 'btn-secondary',
                onclick: () => loadData(currentPage + 1)
            }, 'Next →')
        ),
        // Match History Table
        MatchHistoryTable(history)
    )
}

const MatchHistoryTable = (matches: MatchHistoryEntry[]): VNode => {
    return div({ class: 'mt-6' },
        h2({ class: 'text-xl font-bold mb-2' }, 'Match History'),
        div({ class: 'overflow-x-auto' }, 
            el('table', { class: 'w-full text-left border-collapse' },
                el('thead', { class: 'bg-teal-700 text-white' },
                    el('tr', {},
                        el('th', { class: 'p-2' }, 'Opponent'),
                        el('th', { class: 'p-2' }, 'Score'),
                        el('th', { class: 'p-2' }, 'Result')
                    )
                ),
                el('tbody', {},
                    ...matches.map(m => {
                        const isWin = m.winner_id === client.user?.id;
                        return el('tr', { class: 'border-b border-gray-200' },
                            el('td', { class: 'p-2' }, `Player #${m.opponent_id}`),
                            el('td', { class: 'p-2 font-mono' }, `${m.p1_score} : ${m.p2_score}`),
                            el('td', { class: `p-2 font-bold ${isWin ? 'text-green-600' : 'text-red-600'}` }, 
                                isWin ? 'WIN' : 'LOSS'
                            )
                        );
                    })
                )
            )
        )
    );
};

const loadData = async(page: number = 1) => {
    try {
        isLoading = true;
        updateId(StatsFormDiv);
        const user_id = client.user?.id || 0;
        
        // Ensure you pass the correct token or client instance here
        const [s, h] = await Promise.all([
            fetchUserStats(client, user_id), 
            fetchMatchHistory(client, user_id, page)
        ]);
        
        stats = s;
        history = h;
        currentPage = page;
    } catch (error) {
        console.error("Failed to load statistics:", error);
    } finally {
        isLoading = false;
        updateId(StatsFormDiv);
    }
}