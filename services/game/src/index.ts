import Fastify from "fastify";
import { gameRoutes } from "./routes";

if (!process.env.USER_URL) throw new Error('Missing env USER_URL');
export const USER_URL = process.env.USER_URL!;

function buildGameService() {
  const fastify = Fastify({
    logger: {
      level: 'info',
      transport: {
        target: 'pino-pretty'
      },
    },
    disableRequestLogging: true
  });

  fastify.register(gameRoutes);

  return fastify
}

async function startGame() {
  const fastify = buildGameService();

  try {
    await fastify.listen({ port: 3003 });
  } catch (e: any){
    console.error(e);
  }
}

startGame();
