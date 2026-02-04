import Fastify, { FastifyServerOptions } from "fastify";
import { healthRoute } from "./health";
import { authRoutes } from "./routes";
import { initDB } from "./db";
import fastifyCookie from "@fastify/cookie";
import { createServer } from "@server/fastify/createServer";

const DB_PATH = process.env.DB_PATH;

export function buildAuth(dbPath?: string, options?: FastifyServerOptions) {
  if (!dbPath && !DB_PATH)
    throw new Error("Missing Database Path environment variable");

  initDB(dbPath || DB_PATH!);

  const fastify = createServer(options);

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
    process.exit(1);
  }
}

startAuth();
