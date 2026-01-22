import Fastify from 'fastify'
import fastifyCookie from '@fastify/cookie';
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
  '/stats',
  '/auth/github-oauth',
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

  fastify.register(fastifyCookie);

  const proxy = await import ('@fastify/http-proxy');

  fastify.addHook('onRequest', async (request, reply) => {
    if (!publicRoutes.some(r => request.url.includes(r))) {
      try {
        const response = await fetch(`${AUTH_URL}/validate`, {
          method: 'post',
          headers: {
            'Cookie': request.headers.cookie || ''
          }
        });
        const data = await response.json();

        if (!response.ok) {
          return reply.status(response.status).send(data);
        }

        if (response.status === 201) {
          request.headers.cookie = `${request.headers.cookie || ''}; access_token=${data.access_token}`;
          reply
            .setCookie("access_token", data.access_token, {
              httpOnly: true,
              path: '/',
              sameSite: 'strict',
              secure: 'auto'
            })
            .setCookie('refresh_token', data.refresh_token, {
              httpOnly: true,
              path: '/',
              sameSite: 'strict',
              secure: 'auto'
            })
        }

      } catch (e: any) {
        console.error('Failed to validate: ', e);
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
