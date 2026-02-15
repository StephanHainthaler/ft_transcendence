import Fastify, { FastifyServerOptions } from "fastify";
import { healthRoute } from "./health";
import { authRoutes } from "./routes";
import { initDB } from "./db";
import fastifyCookie from "@fastify/cookie";

export function buildAuth(dbPath?: string, options?: FastifyServerOptions) {
  initDB(dbPath || process.env.DB_FILE_PATH!);

  const fastify = Fastify({
    logger: {
      transport: {
        target: 'pino-pretty'
      },
      level: 'info',
    },
    disableRequestLogging: true,
    ...options
  });

  fastify.register(fastifyCookie);
  fastify.register(healthRoute);
  fastify.register(authRoutes);

  fastify.addHook('onResponse', async (request, reply) => {
    if (reply.statusCode >= 400) {
      request.log.info({
        req: request,
        res: reply,
        err: reply.raw.statusMessage,

      }, 'request completed');
    }
  });

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
