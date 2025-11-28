import { db, user_stats_table, match_history_table } from './database';
import { eq } from '@server/orm';
import { UserStats, MatchHistoryEntry, MatchSubmissionData } from '@shared/game_stats';
import { ApiError } from '@server/error/apiError';

export const MATCHES_PER_PAGE = 5;
export const USERS_PER_PAGE = 5;

/**
 * Retrieves the detailed statistics for a single user by their ID.
 * * This function uses the ORM Query Builder to select a single row
 * from the 'user_stats' table.
 * * @param {number} userId - The unique identifier of the user (ID).
 * @returns {UserStats | null} The user statistics object (UserStats), 
 * or null if the user is not found.
 */
export function getUserStats(userId: number): UserStats | null
{
	return db
		.from<'user_stats'>('user_stats')
		.select('*')
		.where(eq('user_id', userId))
		.single();
}

/**
 * Retrieves the details of a specific match from the history by its unique ID.
 * * This is useful for reviewing the detailed results and duration of a single game.
 * * @param {number} MatchID - The unique identifier of the match (match_id).
 * @returns {MatchHistoryEntry | null} The match history entry object (MatchHistoryEntry), 
 * or null if the match is not found.
 */
export function getMatchStats(MatchID: number): MatchHistoryEntry | null
{
	return db
		.from<'match_history'>('match_history')
		.select('*')
		.where(eq('match_id', MatchID))
		.single();
}

/**
 * Retrieves a paginated list of match history entries for a given user.
 * * The query filters for matches where the user is either player_one OR player_two,
 * sorts the results by timestamp (newest first), and applies pagination limits.
 *
 * @param {number} userId - The unique identifier of the user whose history is requested.
 * @param {number} page - The page number (starting from 1) for pagination.
 * @returns {(MatchHistoryEntry[] | null)} An array of match history entries, or empty array if an error occurs.
 */
export function getUserMatchHistory(userId: number, page: number): MatchHistoryEntry[] | []
{
	const offset = (page - 1) * MATCHES_PER_PAGE;
	return db
		.from<'match_history'>('match_history')
		.select('*')
		.where(eq('player_one', userId))
		.or(eq('player_two', userId))
		.desc('timestamp')
		.limit(MATCHES_PER_PAGE)
		.offset(offset)
		.all();
}

function updateStatsForUser(userId: number, isWinner: boolean, score: number)
{
	const currentStats = getUserStats(userId);
	const RANK_CHANGE_WIN = 10;
	const RANK_CHANGE_LOSS = -5;
	if (!currentStats)
	{
		const initialRank = 1000 + (isWinner == true ? RANK_CHANGE_WIN : RANK_CHANGE_LOSS);
		db.from('user_stats').insert({
			user_id: userId,
			wins: isWinner ? 1 : 0,
			losses: isWinner ? 0 : 1,
			streak: isWinner ? 1 : 0,
			total_points: score, 
			rank: initialRank,
			highest_score: score
		}).run();
	}
	else
	{
		const newWins = currentStats.wins + (isWinner == true ? 1 : 0);
		const newLosses = currentStats.losses + (isWinner == true ? 0 : 1);
		const newStreak = isWinner == true ? (currentStats.streak || 0) + 1 : 0;
		const newPoints = (currentStats.total_points || 0) + score;
		const newHighestScore = Math.max(currentStats.highest_score || 0, score);
		let newRank = (currentStats.rank || 1000) + (isWinner == true ? RANK_CHANGE_WIN : RANK_CHANGE_LOSS);
		if (newRank < 0)
			newRank = 0; 
		db.from('user_stats').update({
			wins: newWins,
			losses: newLosses,
			streak: newStreak,
			total_points: newPoints,
			rank: newRank,
			highest_score: newHighestScore
		})
		.where(eq('user_id', userId))
		.run();
	}
}

/**
 * Records the results of a completed match by performing two main actions:
 * 1. Inserts a new record into the 'match_history' table.
 * 2. Calls updateStatsForUser for both players to update their 'user_stats' (rank, streak, etc.).
 * * Note: This function correctly determines the winner/loser status for each player 
 * based on the submitted data before updating their stats.
 * * @param {MatchSubmissionData} data - The detailed result data from the completed game.
 * @returns {void}
 */
export function recordMatch(data: MatchSubmissionData) : void
{
	try
	{
		const timestamp = Math.floor(Date.now() / 1000); 

		db.from('match_history').insert({
			timestamp: timestamp,
			player_one: data.player_one_id,
			player_two: data.player_two_id,
			winner_id: data.winner_id,
			match_duration: data.duration || 0,
			score_p1: data.p1_score,
			score_p2: data.p2_score, 
		}).run();

		if (data.winner_id == data.player_one_id) {
			updateStatsForUser(data.player_one_id, true, data.p1_score);
			updateStatsForUser(data.player_two_id, false, data.p2_score);
		} else {
			updateStatsForUser(data.player_one_id, false, data.p1_score);
			updateStatsForUser(data.player_two_id, true, data.p2_score);
		}
	}
	catch (dbError) 
	{
		console.error("Database error during match recording:", dbError);
		throw new ApiError
		({
			message: "Failed to process match result due to a server error.", 
			code: 500 
		});
	}
}

/**
 * Retrieves the global player ranking (Leaderboard) with pagination.
 * The results are sorted primarily by 'rank' in descending order, 
 * and secondarily by 'total_points' to handle ties in rank.
 * * @param {number} page - The current page number for pagination (must be >= 1).
 * @returns {UserStats[]} An array of UserStats objects representing the leaderboard slice. 
 * Returns an empty array if no users are found on the specified page.
 */
export function getLeaderboard(page: number) : UserStats[] | []
{
	const offset = (page - 1) * USERS_PER_PAGE;
	return db
		.from<'user_stats'>('user_stats')
		.select('*')
		.desc('rank').desc('wins').desc('total_points')
		.limit(USERS_PER_PAGE)
		.offset(offset)
		.all();
}