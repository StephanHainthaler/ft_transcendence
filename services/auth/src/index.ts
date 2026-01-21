import Fastify, { FastifyServerOptions } from "fastify";
import { healthRoute } from "./health";
import { authRoutes } from "./routes";
import { initDB } from "./db";

export function buildAuth(dbPath?: string, options?: FastifyServerOptions) {
  initDB(dbPath || process.env.DB_FILE_PATH!);

  const fastify = Fastify({
    logger: {
      level: 'info',
      transport: {
        target: 'pino-pretty'
      },
    },
    disableRequestLogging: true,
    ...options
  });

  fastify.register(healthRoute);
  fastify.register(authRoutes);

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
