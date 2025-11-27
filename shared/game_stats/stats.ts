export interface UserStats {
	user_id: number;
	wins: number;
	losses: number;
	rank?: number;
	total_points?: number; //Total Points Scored (across all games)
	streak?: number;
	highest_score?: number;
}

export interface MatchHistoryEntry {
	match_id: number;
	timestamp: number; //Unix-time??
	player_one: number;
	player_two: number;
	winner_id: number;
	match_duration?: number;
}

export interface MatchSubmissionData {
    winner_id: number;
    loser_id: number;
    winner_nickname: string;
    loser_nickname: string;
    winner_score: number;
    loser_score: number;
    duration?: number;
}