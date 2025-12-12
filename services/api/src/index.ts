import Fastify from 'fastify'
import { healthRoutes } from './healthcheck/healthcheck';

const AUTH_URL = process.env.AUTH_SERVICE_URL;

const USER_URL = process.env.USER_SERVICE_URL;

const GAME_STATS_URL = process.env.GAME_STATS_SERVICE_URL;

const SERVER_PONG_URL = process.env.SERVER_PONG_URL;

const publicRoutes = [
  '/auth/login',
  '/auth/refresh',
  '/auth/sign-up',
  '/user/avatar',
  '/game',
];

async function startApiGateway() {

  if (!AUTH_URL) throw new Error("AUTH_SERVICE_URL is not defined");
  if (!USER_URL) throw new Error("USER_SERVICE_URL is not defined");
  if (!GAME_STATS_URL) throw new Error("GAME_STATS_SERVICE_URL is not defined");
  if (!SERVER_PONG_URL) throw new Error("SERVER_PONG_URL is not defined");

  const fastify = Fastify({
    logger: {
      transport: {
        target: 'pino-pretty'
      },
    },
    disableRequestLogging: true
 });

  const proxy = await import ('@fastify/http-proxy');

  console.log(`API_URL: ${process.env.API_URL}`);

  fastify.addHook('onRequest', async (request, reply) => {
    if (request.url.startsWith('/internal')) {
      if ((request.ip === '127.0.0.1')) {

      }
    }

    if (!publicRoutes.some(r => request.url.includes(r))) {
      const authHeader = request.headers.authorization;
      if (!authHeader) {
        return reply.code(401).send({ success: false, message: 'Missing auth header' });
      } else if (!authHeader.startsWith('Bearer ')) {
        return reply.code(401).send({ success: false, message: 'Invalid auth header' });
      }

      const token = authHeader.replace('Bearer ', '');

      try {
        const response = await fetch(`${AUTH_URL}/validate`, {
          method: 'post',
          headers: {
            'Authorization': authHeader,
          },
          body: JSON.stringify({ token: token }),
        });
        const data = await response.json();
        if (!response.ok) return reply.status(response.status).send(data);
      } catch (e: any) {
        return reply.code(401).send({ message: 'You are not authenticated' });
      }
    }
  });

  fastify.register(proxy, {
    upstream: USER_URL,
    prefix: '/user',
    http2: false,
  });

  fastify.register(proxy, {
    upstream: AUTH_URL,
    prefix: '/auth',
    http2: false,
  });

  fastify.register(proxy, {
    upstream: SERVER_PONG_URL,
    prefix: '/game',
    websocket: true,
  });

  fastify.register(proxy, {
    upstream: GAME_STATS_URL,
    prefix: '/stats',
    http2: false,
  })

  fastify.register(healthRoutes, {
    prefix: "/health"
  });

  try {
    await fastify.listen({ port: 3000, host: '0.0.0.0' });
  } catch (err: any) {
    fastify.log.error(err);
    process.exit(1);
  }
}

startApiGateway();
