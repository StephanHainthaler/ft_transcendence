import { Separator } from "@lib/components/ui/Seperator";
import type { Route } from "@lib/types/route";
import { button, div, form, h1, h2, updateId, span, type VNode } from "@lib/vdom";
import { client } from "@lib/index";
import { Layout } from "@lib/components/layout";
import { fetchUserStats, fetchMatchHistory } from "@lib/api/gameStats";
import type { UserStats, MatchHistoryEntry } from "@shared/game_stats";


let stats: UserStats | null = null;
let history: MatchHistoryEntry[] = [];
let isLoggedIn: boolean = true;
let isLoading: boolean = true;
let currentPage: number = 1;

const StatsFormDiv = (): VNode =>
{
    if (isLoading)
        return (div({id: 'stats-content', class: 'p-10'}, 'Loading...'));
    //const rankValue = stats ? stats?.rank?.toString() : '0';
    // let rankValue = '0';
    // if (stats && typeof stats.rank === 'number') {
    //     rankValue = stats.rank.toString();
    const currentRank = stats?.rank?.toString() ?? '0';
    const currentWins = stats?.wins?.toString() ?? '0';
    return div({ id: 'stats-content', class: 'card' },
        h1({ class: 'title' }, 'Статистика гравця'),
        div({ class: 'rank-box' }, 
        span({}, 'Ваш ранг: '),
        span({ class: 'font-bold' }, stats?.rank?.toString() || '0'))
    )
}

const loadData = async(page: number = 1) =>
{
    try
    {
        isLoggedIn = true;
        updateId(StatsFormDiv);
        const user_id = client.user?.id || 0;
        const [s, h] = await Promise.all([fetchUserStats(client. , user_id), ]);

    } catch (error)
    {

    }
}