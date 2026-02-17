import type { AppUser } from "@lib/api/appUser";
import { aiUser } from "@lib/game";
import type { Game } from "@shared/user";

export class Tournament {
  private originalPlayers: AppUser[];
  private currentPlayers: AppUser[] = [];
  private nextRoundPlayers: AppUser[] = [];
  private currentGame?: Game;

  constructor(players?: AppUser[]) {
    this.currentPlayers = players ?? [];
  }

  setPlayers(players: AppUser[]) {
    this.originalPlayers = players;
    this.currentPlayers = players;
    if (this.currentPlayers.length % 4 !== 0) {
      const playerDiff = this.currentPlayers.length % 4;
      this.currentPlayers.push(...Array(playerDiff).fill(aiUser));
    }
  }

  finish() {

  }

  get players(): AppUser[] {
    return this.currentPlayers;
  }

  get nextPlayers(): AppUser[] {
    return this.nextRoundPlayers;
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
      this.currentPlayers = this.currentPlayers.splice(0, 2);
    }
  }

  isDone() {
    if (this.currentPlayers.length === 0 && this.nextRoundPlayers.length === 1) {
      return true;
    }
    return false;
  }

  nextRound() {
    this.currentPlayers = this.nextRoundPlayers;
    this.nextRoundPlayers = [];
  }

  getSchedule(): Game[] {
    let games: Game[] = [];
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
}
