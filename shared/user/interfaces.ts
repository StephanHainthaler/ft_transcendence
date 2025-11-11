import { Argument } from "../orm/query";

export interface User extends Record<string, Argument> {
  id: number,
  name: string,
  email?: string,
}

export interface Game extends Record<string, Argument> {
  id: number,
  player1: number,
  player2: number,
  score1: number,
  score2: number
  date: string,
  duration: number,
}

/* Junction table between users and played games */
export interface UserGame extends Record<string, Argument> {
  game_id: number,
  user_id: number,
}
