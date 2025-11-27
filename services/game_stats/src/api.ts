import { db, user_stats_table, match_history_table } from './database';
//import { Query } from '@server/orm';
import { UserStats, MatchHistoryEntry } from '@shared/game_stats';
//import { MatchSubmissionData } from '@shared/user/game';

/**
 * Retrieves the detailed statistics for a single user by their ID.
 * * This function uses the ORM Query Builder to select a single row
 * from the 'user_stats' table.
 * * @param {number} userId - The unique identifier of the user (ID).
 * @returns {UserStats | null} The user statistics object (UserStats), 
 * or null if the user is not found.
 */
export function getUserStats(userId: number): UserStats | null {
	return db
		.from<'user_stats'>('user_stats')
		.select('*')
		.eq('user_id', userId)
		.single();
}

/**
 * Retrieves the details of a specific match from the history by its unique ID.
 * * This is useful for reviewing the detailed results and duration of a single game.
 * * @param {number} MatchID - The unique identifier of the match (match_id).
 * @returns {MatchHistoryEntry | null} The match history entry object (MatchHistoryEntry), 
 * or null if the match is not found.
 */
export function getMatchStats(MatchID: number): MatchHistoryEntry | null {
	return db
		.from<'match_history'>('match_history')
		.select('*')
		.eq('match_id', MatchID)
		.single();
}

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