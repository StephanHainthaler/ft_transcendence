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
    prefix: '/friend/',
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
    await fastify.listen({ host: '0.0.0.0', port: 3001 });
  } catch (e: any) {
    console.error(e);
  }
}

startService();
