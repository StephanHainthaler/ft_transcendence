import { DB, int, text, defineTable, modelDefinition } from "@server/orm"
import { Game, User, UserGame, Friendship, Avatar } from "@shared/user";
import { ModelCols } from "@shared/db";

export interface Schema {
  users: ModelCols & User,
  games: ModelCols & Game,
  avatars: ModelCols & Avatar,
  user_games: ModelCols & UserGame,
  friendships: ModelCols & Friendship,
  date: string,
};

const users = defineTable('users', {
  ...modelDefinition(),
  name: text().notNull(),
  user_name: text().unique().notNull(),
  two_fa_enabled: int().default(0),
});

const avatars = defineTable('avatars', {
  ...modelDefinition(),
  user_id: int().notNull().references(() => users.columns.id),
  location: text().notNull(),
})

// DEPRECATED
const games = defineTable('games', {
  ...modelDefinition(),
  player1: int().notNull(),
  player2: int().notNull(),
  score1: int().notNull(),
  score2: int().notNull(),
  duration: text().notNull(),
  date: text().notNull().default('CURRENT_DATE'),
});

const user_games = defineTable('user_games', {
  ...modelDefinition(),
  game_id: int().references(() => games.columns.id),
  user_id: int().references(() => users.columns.id),
});

const user_friends = defineTable('friendships', {
  ...modelDefinition(),
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
