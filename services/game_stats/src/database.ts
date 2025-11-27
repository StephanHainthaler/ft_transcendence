import { DB } from "@server/orm";
import { int, text, defineTable } from "@server/orm";
import { UserStats, MatchHistoryEntry } from "@shared/game_stats";

export interface Schema {
	user_stats: UserStats;
	match_history: MatchHistoryEntry;
}

export const user_stats_table = defineTable('user_stats', {
	user_id: int().primarykey(), 
	wins: int().notNull().default(0),
	rank: int().notNull().default(0),
	losses: int().notNull().default(0),
	total_points: int().notNull().default(0),
	highest_score: int().notNull().default(0),
	streak: int().notNull().default(0),
});

export const match_history_table = defineTable('match_history', {
	match_id: int().primarykey().autoIncrement().notNull(),
	timestamp: int().notNull(), //Unix-time??
	player_one: int().notNull().references(() => user_stats_table.columns.user_id),
	player_two: int().notNull().references(() => user_stats_table.columns.user_id),
	winner_id: int().notNull().references(() => user_stats_table.columns.user_id),
	match_duration: int().default(0),
});

export const db = new DB<Schema>();

//Alternative way (inline), but without reusability
// export const db = new DB<{ 
//     user_stats: UserStats; 
//     match_history: MatchHistoryEntry; 
// }>();

export function initDB(path: string) {
	db.open(path);
	db.create([user_stats_table, match_history_table]);
}