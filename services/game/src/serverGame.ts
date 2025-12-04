import { Game } from "@shared/user";
import { WebSocket } from "@fastify/websocket";
import { GameState, Message, MovementMessage, RunningMessage, SetupMessage, StateMessage } from "@shared/game";

import { BALL_STARTING_POS, PLAYER_ONE_STARTING_POS, PLAYER_STARTING_SCORE, PLAYER_TWO_STARTING_POS } from "@shared/game/players";

export class ServerGame {
  private game?: Game;
  private gameState: GameState;
  private socket: WebSocket;
  private running: boolean = false;
  private isSetup: boolean = false;
  private timeDelta: number = 0;
  private connected: boolean = false;
  private gameInterval?: NodeJS.Timeout;

  constructor(socket: WebSocket) {
    this.gameState = {
      playerOnePosition: PLAYER_ONE_STARTING_POS,
      playerTwoPosition: PLAYER_TWO_STARTING_POS,
      playerOneScore: PLAYER_STARTING_SCORE,
      playerTwoScore: PLAYER_STARTING_SCORE,
      ballPosition: BALL_STARTING_POS,
      running: false,
    };
    this.socket = socket;
  }

  get isRunning() { return this.running };

  start() { this.running = true };
  stop() { this.running = false };

  get delta() {
    return this.timeDelta
  }

  getDelta() {

  }

  async reconnect() {
    let i = 0;
    return new Promise<void>((resolve, reject) => {
      let intervalId = setInterval(() => {
        if (i === 5) {
          clearInterval(intervalId);
          reject(new Error("Failed to reconnect"));
        }
        if (this.connected) {
          clearInterval(intervalId);
          resolve();
        }
        console.log(`Reconnecting... try ${i}`);
        i++;
      }, 1000)
    })
  }

  handleMovement(movement: MovementMessage) {
    console.log(`Received MovementMessage: ${movement}`);
    if (movement.movePlayer1Up) {

    } else if (movement.movePlayer1Down) {

    }

    if (movement.movePlayer2Up) {

    } else if (movement.movePlayer1Down) {

    }

    this.respondState();
  }

  handleState(state: StateMessage) {
    throw new Error("TODO: handleState");
  }

  handleRunning(running: RunningMessage) {
    throw new Error("TODO: handleRunning");
  }

  handleSetup(setup: SetupMessage) {
    this.game = {
      id: 0,
      player1: setup.player1,
      player2: setup.player2,
      score1: 0,
      score2: 0,
    }
    this.isSetup = true;
    this.gameState.running = true;
  }

  respondState() {
    this.socket.send(JSON.stringify(this.gameState));
  }

  abort() {
    clearInterval(this.gameInterval);
  }

  init() {
    console.log('init starting')

    console.log(this.socket);
    this.socket.on('close', async code => {
      console.log('closing connection');
      if (code === 1000) {
        if (this.running) {
          this.abort();
        }
      } else if (code === 1006) {
        if (this.connected) {
          this.connected = false;
          try {
            await this.reconnect();
          } catch (e: any) {
            this.abort();
            console.error(`Encountered Connection Error: ${e}`);
          }
        }
      }
    })

    console.log('after close');

    this.socket.on('message', (data) => {
      console.log(data);
      const message: Message = JSON.parse(data.toString());
      if (this.isSetup === false) {
        if (message.setup) {
          this.handleSetup(message.setup);
        } else {
          return ;
        }
      }
      if (message.movement) {
        this.handleMovement(message.movement);
      }
      if (message.state) {
        this.handleState(message.state);
      }
      if (message.running) {
        this.handleRunning(message.running);
      }
      console.log(message);
    });

    console.log('starting interval');
    this.gameInterval = setInterval(() => {
      this.respondState();
    }, 16)
  }
}
