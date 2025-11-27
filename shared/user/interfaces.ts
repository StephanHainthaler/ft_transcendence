export interface User extends Record<string, string | number | undefined> {
  id: number,
  name: string,
  username?: string,
  email?: string,
}

export interface Game extends Record<string, string | number | undefined> {
  id: number,
  player1: number,
  player2: number,
  score1: number,
  score2: number
  date: string,
  duration: number,
}

/* Junction table between users and played games */
export interface UserGame extends Record<string, string | number | undefined> {
  game_id: number,
  user_id: number,
}

export interface AuthUserClient {
  username?: string,
  email?: string,
}

export interface Friendship {
  id: number,
  user_from_id: number,
  user_to_id: number,
  status: 'pending' | 'accepted' | 'rejected',
}
