import { DB } from "@shared/orm";

import { int, text, defineTable } from "@shared/orm"
import { Game, User, UserGame } from "@shared/user";

export interface Schema {
  users: User,
  games: Game,
  user_games: UserGame,
};

const users = defineTable('users', {
  id: int().primarykey().autoIncrement().notNull(),
  name: text().notNull(),
});

const games = defineTable('games', {
  id: int().primarykey().autoIncrement().notNull(),
  player1: int().notNull(),
  player2: int().notNull(),
  score1: int().notNull(),
  score2: int().notNull(),
  duration: text().notNull(),
  date: text().notNull().default('CURRENT_DATE'),
});

const user_games = defineTable('user_games', {
  game_id: int().references(() => games.columns.id),
  user_id: int().references(() => users.columns.id),
});

export function initTables() {
  return { users, games, user_games };
}

export const db = new DB<Schema>();

export function initDB(path: string) {
  const { users, user_games, games } = initTables();

  db.open(path);
  db.create([users, user_games, games]);
}
