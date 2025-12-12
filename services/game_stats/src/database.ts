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
	player_one_id: int().notNull().references(() => user_stats_table.columns.user_id),
	player_two_id: int().notNull().references(() => user_stats_table.columns.user_id),
	winner_id: int().notNull().references(() => user_stats_table.columns.user_id),
	match_duration: int().default(0),
	p1_score: int().notNull(), 
    p2_score: int().notNull()
});

// export let db = new DB<Schema>();
let databaseInstance: DB<Schema> | null = null;

export function getDb(): DB<Schema> {
	if (!databaseInstance) {
        throw new Error("Database has not been initialized. Please call setDb() first.");
    }
    return databaseInstance;
}

/**
 * Sets the database instance for the application.
 * Returns true if the database was successfully initialized, false if it was already set.
 */
export function setDb(newDb: DB<Schema>): boolean {
    if (databaseInstance) {
        console.warn("Warning: Overwriting an existing database instance.");
    }
    databaseInstance = newDb;
    return true;
}

export function initDB(path: string) {
	const db = new DB<Schema>();
	db.open(path);
	db.create([user_stats_table, match_history_table]);
	setDb(db);
}