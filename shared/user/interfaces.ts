import { AppUser } from "./appUser"

export interface User extends Record<string, string | number | undefined> {
  id: number,
  name: string,
  user_name?: string,
}

export interface Game {
  player1: AppUser,
  player2: AppUser,
  score1: number,
  score2: number
  duration?: number,
}

/* Junction table between users and played games */
export interface UserGame extends Record<string, string | number | undefined> {
  game_id: number,
  user_id: number,
}

export interface AuthUserClient {
  user_name?: string,
  email?: string,
  two_fa_enabled?: number,
}

export interface Friendship {
  id: number,
  user_from_id: number,
  user_to_id: number,
  status: 'pending' | 'accepted' | 'rejected',
}

export interface Avatar {
  id: number,
  user_id: number,
  location: string
}
