import { int, text, defineTable } from "@shared/orm"

export const users = defineTable('users', {
  id: int().primarykey().autoIncrement().notNull(),
  name: text().notNull(),
})

export const games = {
  id: int().primarykey().autoIncrement().notNull(),
  player1: int().notNull(),
  player2: int().notNull(),
  score1: int().notNull(),
  score2: int().notNull(),
}

export const user_games = defineTable('user_games', {
  game_id: int().references(() => games.id),
  user_id: int().references(() => users.id),
});
