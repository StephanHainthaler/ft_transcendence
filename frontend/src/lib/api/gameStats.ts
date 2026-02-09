import type { UserStats, MatchHistoryEntry, MatchSubmissionData } from "@shared/game_stats";
import { request } from "./utils";
import { toast } from "svelte-sonner";
import { t } from "@lib/i18n/i18n";
import { get } from "svelte/store";

const showNotification = (message: string, error_type: string) => 
{
    console.error("API Error:", error_type);
    toast.error(message); 
};

async function fetchUserStats(userId: number): Promise<UserStats | null> {
    try {
        const req = new Request(`${import.meta.env.VITE_BASE_URL}/api/stats/v1/user/${userId}`, {
            method: "GET",
        });
        const response = await request(req);
        return response;
    } catch (error: any) {
        const tr = get(t);
        showNotification(tr('game.user_stats_load_error') || 'Failed to load user statistics.', "Failed to load user statistics");
        return null;
    }
}

async function fetchMatchHistory(userId: number, page: number = 1): Promise<MatchHistoryEntry[]> {
    try {
        const req = new Request(`${import.meta.env.VITE_BASE_URL}/api/stats/v1/history/${userId}?page=${page}`, {
            method: "GET",
        });
        const response = await request(req);
        return response || [];
    } catch (error: any) {
        const tr = get(t);
        const message = tr('game.match_history_load_error') || 'Failed to load match history.';
        showNotification(message, "Failed to load match history");
        return [];
    }
}

async function fetchLeaderboard(page: number = 1): Promise<UserStats[] | []> {
    try {
        const req = new Request(`${import.meta.env.VITE_BASE_URL}/api/stats/v1/leaderboard?page=${page}`, {
            method: "GET",
        });
        const response = await request(req);
        return response || [];
    } catch (error: any) {
        const tr = get(t);
        showNotification(tr('game.leaderboard_load_error') || 'Failed to load leaderboard.', "Failed to load leaderboard");
        return [];
    }
}

const sendMatchResults = async (matchData: MatchSubmissionData) => {
    try {
        const req = new Request(`${import.meta.env.VITE_BASE_URL}/api/stats/v1/match`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(matchData)
        });

        const response = await request(req);
        return response;
    } catch (error: any) {
        const tr = get(t);
        const message = error.message || tr('game.match_record_error') || 'Failed to record match results.';
        showNotification(message, "Failed to record match results");
        throw error;
    }
};

export { fetchUserStats, fetchMatchHistory, fetchLeaderboard, sendMatchResults };
