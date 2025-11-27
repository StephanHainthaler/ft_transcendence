import { ApiError } from "@server/error/apiError";
import { extractJWTFromHeader } from "@server/jwt/validate";
import { FastifyInstance } from "fastify";
import { USER_URL } from "src";
import { ServerGame } from "./serverGame";
import { runningGames } from "./gameLoop";

export const gameRoutes = (fastify: FastifyInstance) => {
  fastify.get<{
  }>('/start', { websocket: true }, (sock, req) => {
    try {
      const newGame = new ServerGame(sock.socket);
      console.log('new connection established');
      console.log('test');
      newGame.init();
      runningGames.push(newGame);
      console.log('after push');
    } catch (e: any) {
      console.log(e);
      sock.close(1008, 'Unauthorized');
    }
  });
}
