import { db, user_stats_table, match_history_table } from './database';
//import { Query } from '@server/orm';
import { UserStats, MatchHistoryEntry } from '@shared/game_stats';
//import { MatchSubmissionData } from '@shared/user/game';



export function getUserMatchHistory(userId: number, limit: number = 20): MatchHistoryEntry | null {
	return db
		.from<'match_history'>('match_history')
        .select('*')
        .eq('player_one', userId)
        .orWhere('player_two', userId) 
        .desc('timestamp')
        .limit(limit)
        .all();

}