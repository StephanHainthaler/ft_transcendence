import { Separator } from "@lib/components/ui/Seperator";
import type { Route } from "@lib/types/route";
import { button, div, form, h1, h2, updateId, type VNode } from "@lib/vdom";
import { client } from "@lib/index";
import { Layout } from "@lib/components/layout";
import { fetchUserStats, fetchMatchHistory } from "@lib/api/gameStats";
import type { UserStats, MatchHistoryEntry } from "@shared/game_stats";


let stats: UserStats | null = null;
let history: MatchHistoryEntry[] = [];
let isLoggedIn: boolean = true;

const loadData = async() =>
{
    try
    {

    } catch (error)
    {

    }
}