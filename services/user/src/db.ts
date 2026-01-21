import { DB } from "@server/orm";

import { int, text, defineTable } from "@server/orm"
import { Game, User, UserGame, Friendship, Avatar } from "@shared/user";

export interface Schema {
  users: User,
  games: Game,
  avatars: Avatar,
  user_games: UserGame,
  friendships: Friendship,
  date: string,
};

const users = defineTable('users', {
  id: int().primarykey().autoIncrement().notNull(),
  name: text().notNull(),
  user_name: text().unique(),
});

const avatars = defineTable('avatars', {
  id: int().primarykey().autoIncrement().notNull(),
  user_id: int().notNull().references(() => users.columns.id),
  location: text().notNull(),
})

// DEPRECATED
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

const user_friends = defineTable('friendships', {
  id: int().notNull().primarykey().autoIncrement(),
  user_from_id: int().notNull().references(() => users.columns.id),
  user_to_id: int().notNull().references(() => users.columns.id),
  status: text().notNull(),
})

export function initTables() {
  return { users, games, user_games, user_friends, avatars };
}

export const db = new DB<Schema>();

export function initDB(path: string) {
  const { users, user_games, games, user_friends } = initTables();

  db.open(path);
  db.create([users, user_games, games, user_friends, avatars]);
}
