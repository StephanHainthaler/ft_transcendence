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
	player_one_id: number;
	player_two_id: number;
	winner_id: number;
	match_duration: number;
	p1_score: number;
	p2_score: number;
}

export interface MatchSubmissionData {
  player_one_id: number;
  player_two_id: number;
  p1_score: number;
  p2_score: number;
  winner_id: number;
  duration: number;
  timestamp: number;
}