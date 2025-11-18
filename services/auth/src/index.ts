import Fastify from "fastify";
import { healthRoute } from "./health";
import { authRoutes } from "./routes";
import { initDB } from "./db";

export function buildAuth() {
  const fastify = Fastify({
    logger: {
      level: 'info',
      transport: {
        target: 'pino-pretty'
      },
    },
    disableRequestLogging: true
  });

  fastify.register(healthRoute);
  fastify.register(authRoutes);

  initDB(process.env.DB_FILE_PATH!);

  return fastify
}

async function startAuth() {
  const fastify = buildAuth();

  try {
    await fastify.listen({ port: 3002 });
  } catch (e: any){
    console.error(e);
  }
}

startAuth();
