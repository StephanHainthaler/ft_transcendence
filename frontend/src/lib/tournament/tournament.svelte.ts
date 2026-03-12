import { type Game, AppUser } from "@shared/user";
import { aiUser } from "@lib/game";
import { t } from "@lib/i18n/i18n";
import { get } from "svelte/store";
import type { MatchSubmissionData } from "@shared/game_stats";

export class Tournament {
  private currentPlayers: AppUser[] = [];
  private nextRoundPlayers: AppUser[] = [];
  private schedule: Game[] = $state([]);
  private prevSchedules: Game[][] = $state([]);
  private currentGame?: Game = $state();

  constructor(players?: AppUser[]) {
    if (players)
      this.setPlayers(players);
  }

  setPlayers(players?: AppUser[]) {
    if (!players || players?.length === 0) {
      throw Object.assign(new Error(get(t)("Need At least 1 Human player")), {
        isAppError: true
      });
    }
    this.currentPlayers = [...players];
    this.nextRoundPlayers = [];
    this.prevSchedules = [];

    if (this.currentPlayers.length % 4 !== 0) {
      const playerDiff = (4 - this.currentPlayers.length % 4) % 4;
      for (let i = 0; i < playerDiff; i++)
        this.currentPlayers.push(aiUser());
    }

    for (let i = this.currentPlayers.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.currentPlayers[i], this.currentPlayers[j]] = [this.currentPlayers[j], this.currentPlayers[i]];
    }

    this.calcSchedule();
  }

  finish() {
    return this.nextRoundPlayers[0];
  }

  get players(): AppUser[] {
    return this.currentPlayers;
  }

  get nextPlayers(): AppUser[] {
    return this.nextRoundPlayers;
  }

  nextGame() {
    if (this.schedule.length === 0) {
      this.nextRound();
    }
    this.currentGame = this.schedule.shift();
    return this.currentGame;
  }

  registerWin(game: MatchSubmissionData) {
    let winner;
    const id = game.winner_id;
    if (this.currentGame?.player1.id === id) {
      winner = this.currentGame.player1;
    } else if (this.currentGame?.player2.id === id) {
      winner = this.currentGame.player2;
    } else {
      throw Object.assign(new Error(get(t)("tournament.unknownWinId", "Unknown winner id")), {
        isAppError: true
      });
    }
    this.nextRoundPlayers.push(winner);
  }

  isDone() {
    if (this.nextRoundPlayers.length === 1 && this.schedule.length === 0 && this.currentGame === undefined) {
      return true;
    }
    return false;
  }

  private nextRound() {
    if (this.nextRoundPlayers.length > 1) {
      this.currentPlayers = this.nextRoundPlayers;
      this.nextRoundPlayers = [];
      this.calcSchedule()
    }
  }

  private calcSchedule() {
    let games: Game[] = [];
    for (let i = 0; i < this.currentPlayers.length; i += 2) {
      const newGame: Game = {
        player1: this.currentPlayers[i],
        player2: this.currentPlayers[i + 1],
        score1: 0,
        score2: 0,
        duration: 0,
      }
      games.push(newGame);
    }
    this.schedule = games;
    this.prevSchedules.push([...games]);
  }

  getSchedule(): Game[] {
    return this.schedule;
  }
}
