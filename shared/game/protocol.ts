import type { Vector } from "./players";

export interface GameState {
  playerOnePosition: Vector,
  playerTwoPosition: Vector,
  playerOneScore: number,
  playerTwoScore: number,
  ballPosition: Vector,
  running: boolean,
}

export interface SetupMessage {
  player1: number,
  player2: number,
}

export interface MovementMessage {
  movePlayer1Up?: boolean,
  movePlayer1Down?: boolean,
  movePlayer2Up?: boolean,
  movePlayer2Down?: boolean,
}

export interface PauseMessage {
  paused: boolean,
}

export interface RunningMessage {
  running: boolean,
}

export interface StateMessage {
  state: GameState,
}

export interface Message {
  movement?: MovementMessage,
  running?: RunningMessage,
  state?: StateMessage,
  pause?: PauseMessage,
  setup?: SetupMessage,
}
