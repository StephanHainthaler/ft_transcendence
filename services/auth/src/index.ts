import { FastifyServerOptions } from "fastify";
import { healthRoute } from "./health";
import { authRoutes } from "./routes";
import { initDB } from "./db";
import fastifyCookie from "@fastify/cookie";
import { createServer } from "@server/fastify/createServer";

const DB_PATH = process.env.DB_PATH;

export const GITHUB_REDIRECT_URL = process.env.GITHUB_REDIRECT_URL;
if (!GITHUB_REDIRECT_URL) {
  console.error("Missing Github redirect url env Vairable! Exiting...");
  process.exit(1);
}

export const HTTP = process.env.HTTP_PROTOCOL;
if (!HTTP) {
  console.error("Missing Protocol env Vairable! Exiting...");
  process.exit(1);
}

const userUrl = process.env.USER_SERVICE_URL;
if (!userUrl) {
  console.error("Missing USER_SERVICE_URL env Vairable! Exiting...");
  process.exit(1);
}
export const USER_URL = `${HTTP}://${userUrl}`;

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
  try {
    const fastify = buildAuth();

    const shutdown = async () => {
      fastify.log.info('Shutting down gracefully...');
      await fastify.close();
      process.exit(0);
    };
    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);

    await fastify.listen({ host: '0.0.0.0', port: 3002 });
  } catch (e: any){
    console.error(e);
    process.exit(1);
  }
}

startAuth();
