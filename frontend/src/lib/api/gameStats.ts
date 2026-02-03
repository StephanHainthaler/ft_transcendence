import type { UserStats, MatchHistoryEntry } from "@shared/game_stats";
import { request } from "./utils";

async function fetchUserStats(userId: number):  Promise<UserStats | null>
{

	const req = new Request(`/api/stats/v1/user/${userId}`,
		{
			method: "GET",
		}
	);
	const data = await request(req);
	return (data as UserStats);
}

async function fetchMatchHistory(userId: number) : Promise<MatchHistoryEntry[]>
{
	const req = new Request(`/api/stats/v1/history/${userId}`,
		{
			method: "GET",
		}
	);
	const data = await request(req);
	return (data as MatchHistoryEntry[]);
}

async function fetchLeaderboard(page: number = 1): Promise<UserStats[] | []> {
	const req = new Request(`/api/stats/v1/leaderboard?page=${page}`,
		{
			method: "GET",
		}
	);
	const data = await request(req);
	return (data as UserStats[]);
}

export { fetchUserStats, fetchMatchHistory, fetchLeaderboard };
