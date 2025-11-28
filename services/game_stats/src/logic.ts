import { db } from './database'
import { eq } from '@server/orm';
import * as orm from '@server/orm';
import { UserStats, MatchHistoryEntry, MatchSubmissionData } from '@shared/game_stats';

export const MATCHES_PER_PAGE = 5;

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

/**
 * Returns paginated match history for a specific user.
 *
 * The function retrieves matches where the given user participated
 * either as `player_one` or `player_two`, sorted by most recent first.
 *
 * Pagination is applied using a fixed page size (`MATCHES_PER_PAGE`).
 *
 * @param userId - ID of the user whose match history is requested
 * @param page - Page number (starting from 1)
 *
 * @returns Array of match history records for the given user and page
 *
 * @example
 * // Get first page of user match history
 * getUserMatchHistoryPaginated(42, 1);
 *
 * @example
 * // Get third page of user history
 * getUserMatchHistoryPaginated(42, 3);
 */
export function getUserMatchHistoryPaginated(userId: number, page: number): MatchHistoryEntry[] {
    const offset = (page - 1) * MATCHES_PER_PAGE;
    return db
        .from<'match_history'>('match_history')
        .select('*')
        .eq('player_one', userId)
        .or(eq('player_two', userId)) // Шукаємо матчі, де користувач Player One АБО Player Two
        .desc('timestamp')
        .limit(MATCHES_PER_PAGE) 
        .offset(offset)         
        .all();
}