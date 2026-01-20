import type { UserStats, MatchHistoryEntry, MatchSubmissionData } from "@shared/game_stats";
import { request } from "./utils";
import type { Writable } from "@lib/types/writable";
import type { JWT } from "@shared/api";

async function fetchUserStats(token: Writable<JWT | null>, userId: number):  Promise<UserStats | null>
{
	const req = new Request(`/api/stats/v1/user/${userId}`,
		{
			method: "GET",
			headers: {'authorization': `Bearer ${ token.get()?.raw }`},
		}
	);
	const response = await request(req, token);
	const data = await response.json();
	if (!response.ok)
		throw (data);
	return (data as UserStats);
}

async function fetchMatchHistory(token: Writable <JWT | null>, userId: number, page: number = 1) : Promise<MatchHistoryEntry[]>
{
	const req = new Request(`/api/stats/v1/history/${userId}?page=${page}`,
		{
			method: "GET",
			headers: {'authorization': `Bearer ${ token.get()?.raw }`}
		}
	);
	const response = await request(req, token);
	const data = await response.json();
	if (!response.ok)
		throw (data);
	return (data as MatchHistoryEntry[]);
}

async function fetchLeaderboard(token: Writable<JWT | null>, page: number = 1): Promise<UserStats[] | []> {
	const req = new Request(`/api/stats/v1/leaderboard?page=${page}`,
		{
			method: "GET",
			headers: {'authorization': `Bearer ${ token.get()?.raw }`}
		}
	);
	const response = await request(req, token);
	const data = await response.json();
	if (!response.ok)
		throw (data);
	return (data as UserStats[]);
}

async function uploadMatchData(token: Writable<JWT | null>, matchData: MatchSubmissionData) {
  const req = new Request(`/api/stats/v1/match`,
		{
			method: "POST",
			headers: {'authorization': `Bearer ${ token.get()?.raw }`},
			body: JSON.stringify(matchData),
    }
	);
	const response = await request(req, token);
	const data = await response.json();
	if (!response.ok)
		throw (data);
	return (data as MatchHistoryEntry[]);
}

export { fetchUserStats, fetchMatchHistory, fetchLeaderboard, uploadMatchData };