import Fastify, { FastifyServerOptions } from 'fastify'
import { userRoutes } from './routes';
import { initDB } from './db';
import { healthRoute } from './health';

const DB_PATH = process.env.DB_FILE_PATH;
console.log(process.env.DB_FILE_PATH);

if (!DB_PATH) throw new Error("Missing Database path");

export async function buildApp(dbPath?: string, options?: FastifyServerOptions) {
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

  fastify.register(userRoutes);
  fastify.register(healthRoute);
  fastify.addHook('onResponse', async (request, reply) => {
    if (reply.statusCode >= 400) {
      request.log.info({
        req: request,
        res: reply,
        err: reply.raw.statusMessage,

      }, 'request completed');
    }
  });
  return fastify;
}

export async function startService() {
  try {
    const fastify = await buildApp();
    await fastify.listen({ port: 3001 });
  } catch (e: any) {
    console.error(e);
  }
}

startService();
