import { ServerGame } from "./serverGame"

export const runningGames: ServerGame[] = [];

setInterval(() => {
  runningGames.forEach((game) => {
    console.log(game.isRunning)
  })
}, 16);
