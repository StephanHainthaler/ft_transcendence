import type { UserStats, MatchHistoryEntry } from "@shared/game_stats";
import { request } from "./utils";
import type { Writable } from "@lib/types/writable";
import type { JWT } from "@shared/api";

async function fetchUserStats(tocken: Writable<JWT | null>, userId: number):  Promise<UserStats | null>
{
	try
	{
		const response = await fetch(`api/users/${userId}/stats`);
		if(!response.ok)
			return (console.error(`Service error:${response.status}`), null);
		const data: UserStats = await response.json();
		return (data);
	} catch (error)
	{
		console.error("Network error:", error);
		return (null);
	}
}

async function fetchMatchHistory(userId: number) : Promise<MatchHistoryEntry[] | []>
{
try
{
	const response = await fetch(`api/users/${userId}/history`);
	if (!response.ok) return [];
	const data: MatchHistoryEntry[] = await response.json();
	return data;
} catch (error)
{
	return [];
}
}

export { fetchUserStats, fetchMatchHistory };