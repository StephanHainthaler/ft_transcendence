import type { UserStats, MatchHistoryEntry, MatchSubmissionData } from "@shared/game_stats";
import { request } from "./utils";
import type { Writable } from "@lib/types/writable";
import type { JWT } from "@shared/api";

async function fetchUserStats(userId: number):  Promise<UserStats | null>
{

	const req = new Request(`/api/stats/v1/user/${userId}`,
		{
			method: "GET",
		}
	);
	const response = await request(req);
	return (response);
}

async function fetchMatchHistory(userId: number) : Promise<MatchHistoryEntry[]>
{
	const req = new Request(`/api/stats/v1/history/${userId}`,
		{
			method: "GET",
		}
	);
	const response = await request(req);
	return (response);
}

async function fetchLeaderboard(page: number = 1): Promise<UserStats[] | []> {
	const req = new Request(`/api/stats/v1/leaderboard?page=${page}`,
		{
			method: "GET",
		}
	);
	const response = await request(req);
	return (response);
}

const sendMatchResults = async (matchData: MatchSubmissionData) => {
  
  const req = new Request('/api/stats/v1/match',
	{
    	method: 'POST',
		headers:
		{
			'Content-Type': 'application/json'
		},
    	body: JSON.stringify(matchData)
  	}
  );

	const response = await request(req);
	return (response);
}

export { fetchUserStats, fetchMatchHistory, fetchLeaderboard, sendMatchResults };
