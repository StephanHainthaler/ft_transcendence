import { FastifyServerOptions } from 'fastify'
import { userRoutes } from './userRoutes';
import { initDB } from './db';
import { healthRoute } from './health';
import { friendRoutes } from './friendRoutes';
import multipart from "@fastify/multipart";
import { AVATAR_MAX_BYTES } from '@shared/validation';
import { avatarRoutes } from './avatarRoutes';
import fastifyCookie from '@fastify/cookie';
import { createServer } from '@server/fastify/createServer';

const DB_PATH = process.env.DB_PATH;

export const HTTP = process.env.HTTP_PROTOCOL;
if (!HTTP) {
  console.error("Missing Protocol env Vairable! Exiting...");
  process.exit(1);
}

const authUrl = process.env.AUTH_SERVICE_URL;
if (!authUrl) {
  console.error("Missing AUTH_SERVICE_URL env Vairable! Exiting...");
  process.exit(1);
}
export const AUTH_URL = `${HTTP}://${authUrl}`;


export async function buildApp(dbPath?: string, options?: FastifyServerOptions) {
  if (!dbPath && !DB_PATH)
    throw new Error("Missing Database Path environment variable");

  initDB(dbPath || DB_PATH!);

  const fastify = createServer(options);
  fastify.register(fastifyCookie);
  fastify.register(multipart, {
    limits: { fileSize: AVATAR_MAX_BYTES, files: 1, fields: 10 }
  });
  fastify.register(avatarRoutes);
  fastify.register(userRoutes);
  fastify.register(healthRoute);
  fastify.register(friendRoutes, {
    prefix: '/friend',
  });

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

    const shutdown = async () => {
      fastify.log.info('Shutting down gracefully...');
      await fastify.close();
      process.exit(0);
    };
    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);

    await fastify.listen({ host: '0.0.0.0', port: 3001 });
  } catch (e: any) {
    console.error(e);
  }
}

startService();
