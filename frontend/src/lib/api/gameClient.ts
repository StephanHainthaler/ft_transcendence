import type { GameState, Message } from "@shared/game";
import type { Game } from "@shared/user";

export class GameClient {
  private socket: WebSocket;
  private pong?: any;
  private canvas?: HTMLCanvasElement;
  private interval?: NodeJS.Timeout;
  private game?: Game;
  private gameState?: GameState;
  private delta: number = 0;

  private messageBuffer: Message = {};

  constructor() {
    const url = import.meta.env.VITE_SERVER_GAME_WS_URL;
    if (!url) throw new Error('Missing environment VITE_SERVER_GAME_WS_URL');
    this.socket = new WebSocket(`ws://localhost:8080/api/game/start`);
  }

  abort(e: Error) {
    this.pong?.error(e);
    clearInterval(this.interval);
  }

  set canvasElement(canvas: HTMLCanvasElement) {
    this.canvas = canvas
  }

  sendMessageBuffer() {
    try {
      console.log(`sending message buffer ${JSON.stringify(this.messageBuffer)}`)
      this.socket.send(JSON.stringify(this.messageBuffer));
      this.messageBuffer = {};
    } catch (e: any) {
      console.error(e);
      this.abort(e);
    }
  }

  handleClose(e: CloseEvent) {
    const data = e.code;

    if (typeof data !== 'number') {
      console.log(data);
      this.abort(new Error("Expected Data on close"));
    }
    console.info('TODO RECONNECT');
  }

  applyState() {

  }

  renderFrame() {
    // window.requestAnimationFrame(this.pong.render)
  }

  setupInput() {
    this.canvas?.addEventListener('keydown', (e: KeyboardEvent) => {
      e.preventDefault();
      console.log('triggering event');
      if (!this.messageBuffer.movement)
        this.messageBuffer.movement = {};
      if (e.key === 'w') {
        this.messageBuffer.movement.movePlayer1Up = true;
      } else if (e.key === 's') {
        this.messageBuffer.movement.movePlayer1Down = true;
      }
      if (e.key === 'ArrowUp') {
        this.messageBuffer.movement.movePlayer2Up = true;
      } else if (e.key === 'ArrowDown') {
        this.messageBuffer.movement.movePlayer2Down = true;
      }
      if (e.key === 'Escape') {
        this.messageBuffer.pause = { paused: true };
      }
    });
    this.canvas?.addEventListener('mousedown', () => {
      this.canvas?.focus();
    })
  }

  finishGameSuccess() {
    clearInterval(this.interval);
  }

  handleMessage(event: MessageEvent<Message>) {
    try {
      const message = event.data;
      console.log(`Received Message ${message}`);
      if (message.state) {
        this.gameState = message.state.state;
        this.applyState();
      }
    } catch (e: any) {
      this.abort(e);
    }
  }

  init() {
    this.socket.onclose = this.handleClose;
    this.socket.onmessage = this.handleMessage;
    this.setupInput();
    this.interval = setInterval(() => {
      this.sendMessageBuffer();
      this.renderFrame();
    }, 16);
  }

  startGame(player1: number, player2: number) {
    this.messageBuffer.setup = { player1, player2 };
  }
}
