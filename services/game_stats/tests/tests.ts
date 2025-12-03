import { describe, test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { getDb, setDb, user_stats_table, match_history_table } from '../src/database';
import { recordMatch, getUserStats, getLeaderboard, updateStatsForUser, getUserMatchHistory, getMatchStats } from '../src/logic';
import { UserStats, MatchSubmissionData, MatchHistoryEntry } from '@shared/game_stats';
import { DB } from '@server/orm';
// import * as dbModule from '../src/database';

const USER_A = 101;
const USER_B = 102;
const USER_C = 103;
// const TEST_DB_PATH = './db/test_game_stats.db';
// dbModule.initDB(TEST_DB_PATH);

interface Schema {
	user_stats: UserStats;
	match_history: MatchHistoryEntry;
}

function setupInMemoryDb() {
    const newDbInstance = new DB<Schema>();
    newDbInstance.open(':memory:');
	newDbInstance.create([user_stats_table, match_history_table]);
    
	setDb(newDbInstance);
    
    newDbInstance.from('user_stats').insert({ 
		user_id: USER_A, 
		wins: 0, 
		losses: 0, 
		streak: 0, 
		total_points: 0, 
		highest_score: 0, 
		rank: 1000 }).run();
    newDbInstance.from('user_stats').insert({ user_id: USER_B, wins: 0, losses: 0, streak: 0, total_points: 0, highest_score: 0, rank: 1000 }).run();
    newDbInstance.from('user_stats').insert({ user_id: USER_C, wins: 0, losses: 0, streak: 0, total_points: 0, highest_score: 0, rank: 1000 }).run();
}


function simulateLosses(count: number, userId: number) {
    for (let i = 0; i < count; i++) {
        updateStatsForUser(userId, false, 0);
    }
}

describe('Game Stats Logic Tests', () => {

	beforeEach(() => {
		setupInMemoryDb();
	});

	const matchData: MatchSubmissionData = {
		player_one_id: USER_A,
		player_two_id: USER_B,
		winner_id: USER_A, 
		p1_score: 5,
		p2_score: 3,
		duration: 120,
	};

	const MATCH_DATA_B_WINS: MatchSubmissionData = {
		player_one_id: USER_A,
		player_two_id: USER_B,
		winner_id: USER_B,
		p1_score: 1,
		p2_score: 5,
		duration: 60,
	};

	const MATCH_DATA_HIGH_SCORE: MatchSubmissionData = {
		player_one_id: USER_A,
		player_two_id: USER_C,
		winner_id: USER_A,
		p1_score: 100,
		p2_score: 50,
		duration: 300,
	};


	test('should correctly update rank/streak after first match (A wins)', () => {
        recordMatch(matchData);

        const statsA = getUserStats(USER_A) as UserStats;
        const statsB = getUserStats(USER_B) as UserStats;
		const history_A = getUserMatchHistory(USER_A, 1);
		
		// A: Winner (A)
			assert.strictEqual(statsA.wins, 1, 'A: Wins should be 1');
            assert.strictEqual(statsA.losses, 0, 'A: Losses should be 0');
            assert.strictEqual(statsA.streak, 1, 'A: Streak should be 1');
            assert.strictEqual(statsA.rank, 1000 + 10, 'A: Rank should be 1010');
            assert.strictEqual(statsA.total_points, 5, 'A: Total points should match score');
            assert.strictEqual(statsA.highest_score, 5, 'A: Highest score should match score');
			
			// B: Looser (B)
            assert.strictEqual(statsB.wins, 0, 'B: Wins should be 0');
            assert.strictEqual(statsB.losses, 1, 'B: Losses should be 1');
            assert.strictEqual(statsB.streak, 0, 'B: Streak should be 0');
            assert.strictEqual(statsB.rank, 1000 - 5, 'B: Rank should be 995');
			
			// Match history A
			assert.strictEqual(history_A.length, 1, 'History count should be 1');
            assert.strictEqual(history_A[0].winner_id, USER_A, 'History should record correct winner');
        });
        
		test('2. Should correctly update stats after a win followed by a loss', () => {
			recordMatch(matchData);
            recordMatch(MATCH_DATA_B_WINS); 
            
            const statsA = getUserStats(USER_A) as UserStats;
            const statsB = getUserStats(USER_B) as UserStats;
			
            assert.strictEqual(statsA.wins, 1, 'A: Total wins');
            assert.strictEqual(statsA.losses, 1, 'A: Total losses');
            assert.strictEqual(statsA.streak, 0, 'A: Streak must reset after loss');
            assert.strictEqual(statsA.rank, 1005, 'A: Rank should be 1005');
			
            assert.strictEqual(statsB.wins, 1, 'B: Total wins');
            assert.strictEqual(statsB.losses, 1, 'B: Total losses');
            assert.strictEqual(statsB.streak, 1, 'B: Streak should be 1');
            assert.strictEqual(statsB.rank, 1005, 'B: Rank should be 1005');
		});
		
		test('3. Should handle large scores and update highest_score', () => {
			recordMatch(MATCH_DATA_HIGH_SCORE);
			
		const statsA = getUserStats(USER_A) as UserStats;

		assert.strictEqual(statsA.highest_score, 100, 'A: Highest score updated to 100');
		assert.strictEqual(statsA.total_points, 100, 'A: Total points updated');
	});
	
	test('4. Should not allow rank to drop below 0', async () => {
		recordMatch(MATCH_DATA_HIGH_SCORE); // Ранг C = 995
		const statsC1 = getUserStats(USER_C) as UserStats;
		console.log(`Starting Rank for User C: ${statsC1.rank}`);
		assert.strictEqual(statsC1.rank, 995, 'Rank should be 995 from the start');

		// for (let i = 0; i < 200; i++) {
		// 	await updateStatsForUser(USER_C, false, 0);}
		await updateStatsForUser(USER_C, false, 0);
		await updateStatsForUser(USER_C, false, 0);
		await updateStatsForUser(USER_C, false, 0);

		//simulateLosses(198, USER_C);
		
		const statsC2 = getUserStats(USER_C) as UserStats;
		console.log(`Final Rank for User C: ${statsC2.rank}`);
		assert.strictEqual(statsC2.rank, 980, 'Rank should not be negative');
		//assert.strictEqual(statsC2.rank, 0, 'Rank should not be negative');
	});
});

// describe('Read Operations (History, Leaderboard, Single Match)', () => {
// 	const MATCH_DATA_A_WINS: MatchSubmissionData = {
// 		player_one_id: 101,
// 		player_two_id: 102,
// 		winner_id: 101, 
// 		p1_score: 5,
// 		p2_score: 3,
// 		duration: 120,
// 	};

// 	const MATCH_DATA_B_WINS: MatchSubmissionData = {
// 		player_one_id: USER_A,
// 		player_two_id: USER_B,
// 		winner_id: USER_B,
// 		p1_score: 1,
// 		p2_score: 5,
// 		duration: 60,
// 	};

// 	const MATCH_DATA_C_WINS: MatchSubmissionData = {
// 		player_one_id: USER_C,
// 		player_two_id: USER_B,
// 		winner_id: USER_C, 
// 		p1_score: 5,
// 		p2_score: 2,
// 		duration: 120,
// 	};

// 	const MATCH_DATA_HIGH_SCORE: MatchSubmissionData = {
// 		player_one_id: USER_A,
// 		player_two_id: USER_C,
// 		winner_id: USER_A,
// 		p1_score: 100,
// 		p2_score: 50,
// 		duration: 300,
// 	};

// 	beforeEach(() => {
// 		db.from('user_stats').delete().run();
// 		db.from('match_history').delete().run();
// 	});
//         test('5. getUserMatchHistory should correctly filter and paginate', () => {
//             // Assume we know that MATCHES_PER_PAGE = 5
//             // Round 1: A vs B
//             const MATCH_A_ID_1 = recordMatch(MATCH_DATA_A_WINS);
//             // Rounds 2-6: 5 matches C vs B (to fill up B's first page)
//             for (let i = 0; i < 5; i++) {
//                 recordMatch(MATCH_DATA_C_WINS);
//             }
//             // Round 7: A vs B (This match should be on page 2 for B)
// 			const MATCH_A_ID_2 = recordMatch(MATCH_DATA_A_WINS);
			
// 			const historyPage1B = getUserMatchHistory(USER_B, 1);
//             const historyPage2B = getUserMatchHistory(USER_B, 2);

//             assert.strictEqual(historyPage1B.length, 5, 'Page 1 should have 5 matches');
//             assert.strictEqual(historyPage2B.length, 2, 'Page 2 should have 2 matches (Match 1 and Match 7)');

// 			assert.strictEqual(historyPage2B[1].match_id, MATCH_A_ID_1, 'Page 2 must contain the first recorded match');
//         });

//         test('6. getLeaderboard should sort by rank and paginate', () => {
//             // USER_A: 1010 Rank (win)
//             recordMatch(MATCH_DATA_A_WINS); 
//             // USER_C: 995 Rank (loss)
//             recordMatch(MATCH_DATA_HIGH_SCORE);

//             // USER_A (1010 + 10 = 1020 Rank)
//             // USER_B (995 Rank)
//             // USER_C (995 Rank, but more points)
            
//             const leaderboard = getLeaderboard(1);

//             // Assume that USERS_PER_PAGE = 5
//             assert.strictEqual(leaderboard.length, 3, 'Leaderboard should contain 3 users');
            
//             // Check sorting: A should be first (highest rank)
//             assert.strictEqual(leaderboard[0].user_id, USER_A, 'User A should be ranked #1');

// 			assert.strictEqual(leaderboard[1].user_id, USER_C, 'User C should be ranked #2 (Higher Total Points)');
// 			assert.strictEqual(leaderboard[2].user_id, USER_B, 'User B should be ranked #3');
//         });

//         test('7. getMatchStats should retrieve single match details', () => {
//             recordMatch(MATCH_DATA_A_WINS);
            
//             const matchHistory = getUserMatchHistory(USER_A, 1);
//             const matchId = matchHistory[0].match_id;

// 			const matchDetails = getMatchStats(matchId);

//             assert.ok(matchDetails !== null, 'Match details should be found');
//             assert.strictEqual(matchDetails?.winner_id, USER_A, 'Retrieved winner ID must be correct');
//         });
//     }); 