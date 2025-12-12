import type { AppUser } from "@lib/api/appUser";
import type { Game } from "@shared/user";

export class Tournament {
  private currentPlayers: AppUser[] = [];
  private nextRoundPlayers: AppUser[] = [];
  private currentGame?: Game;
  private isRunning: boolean = false;
  inGame: boolean = false;

  constructor() {}

  set players(players: AppUser[]) {
    this.currentPlayers = players;
  }

  get players(): AppUser[] {
    return this.currentPlayers;
  }

  get nextPlayers(): AppUser[] {
    return this.nextRoundPlayers;
  }

  get running() {
    return this.isRunning;
  }

  stop() {
    this.isRunning = false;
  }

  start() {
    this.isRunning = true;
  }

  fixUnevenPlayers() {
    if (this.currentPlayers.length % 2 !== 0) {
      const player = this.currentPlayers.pop();
      if (player) this.nextRoundPlayers.push(player);
    }
  }

  nextGame() {
    if (this.currentPlayers.length % 2 == 0) {
      this.currentGame = {
        id: 0,
        player1: this.currentPlayers[0].id,
        player2: this.currentPlayers[1].id,
        score1: 0,
        score2: 0,
        date: Date.now().toLocaleString(),
        duration: 0,
      };
    }
    return this.currentGame;
  }

  registerWin(id: number) {
    const player = this.currentPlayers.find(u => u.id === id);
    if (player) {
      this.nextRoundPlayers.push(player)
      this.currentPlayers = this.currentPlayers.filter(u => u.id !== id);
    }
  }

  getSchedule(): Game[] {
    let games: Game[] = [];
    this.fixUnevenPlayers();
    for (let i = 0; i < this.currentPlayers.length; i += 2) {
      const newGame = {
        id: 0,
        player1: this.currentPlayers[i].id,
        player2: this.currentPlayers[i + 1].id,
        score1: 0,
        score2: 0,
        date: Date.now().toLocaleString(),
        duration: 0,
      }
      games.push(newGame);
    }
    return games;
  }

  getNextSchedule(): Game[] {
    let games: Game[] = [];
    for (let i = 0; i < this.nextRoundPlayers.length; i += 2) {
      const newGame = {
        id: 0,
        player1: this.nextRoundPlayers[i].id,
        player2: this.nextRoundPlayers[i + 1]?.id ?? 0,
        score1: 0,
        score2: 0,
        date: Date.now().toLocaleString(),
        duration: 0,
      }
      games.push(newGame);
    }
    return games;
  }
}

