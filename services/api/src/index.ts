import fastifyCookie from '@fastify/cookie';
import { healthRoutes } from './health';
import { createServer } from "@server/fastify/createServer";

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

const userUrl = process.env.USER_SERVICE_URL;
if (!userUrl) {
  console.error("Missing USER_SERVICE_URL env Vairable! Exiting...");
  process.exit(1);
}
export const USER_URL = `${HTTP}://${userUrl}`;

const gameStatsUrl = process.env.GAME_STATS_SERVICE_URL;
if (!gameStatsUrl) {
  console.error("Missing GAME_STATS_SERVICE_URL env Vairable! Exiting...");
  process.exit(1);
}
export const GAME_STATS_URL  = `${HTTP}://${gameStatsUrl}`;

const publicRoutes = [
  '/auth/login',
  '/auth/refresh',
  '/auth/sign-up',
  '/user/avatar',
  '/stats',
  '/auth/github-oauth',
  '/health',
];

async function startApiGateway() {

  if (!AUTH_URL) throw new Error("AUTH_SERVICE_URL is not defined");
  if (!USER_URL) throw new Error("USER_SERVICE_URL is not defined");
  if (!GAME_STATS_URL) throw new Error("GAME_STATS_SERVICE_URL is not defined");

  const fastify = createServer();

  fastify.register(fastifyCookie);

  const proxy = await import ('@fastify/http-proxy');

  fastify.addHook('onRequest', async (request, reply) => {
    console.info(`REQUEST WITH URL ${request.originalUrl}`);
    if (!publicRoutes.some(r => request.url.includes(r))) {
      let response: Response;
      try {
        const authReqUrl = `${AUTH_URL}/validate`;
        response = await fetch(authReqUrl, {
          method: 'post',
          headers: {
            'Cookie': request.headers.cookie || ''
          }
        });
      } catch (e: any) {
        request.log.error('Auth service connection failed: ', e);
        const code = e.code || e.cause?.code;
        if (code === 'ECONNREFUSED') {
          return reply.code(503).send({ success: false, message: 'Authentication service is not running' });
        }
        if (code === 'ECONNRESET' || code === 'ETIMEDOUT' || code === 'UND_ERR_CONNECT_TIMEOUT') {
          return reply.code(504).send({ success: false, message: 'Authentication service timed out' });
        }
        return reply.code(502).send({ success: false, message: 'Authentication service unavailable' });
      }

      try {
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
              secure: HTTP === 'https'
            })
            .setCookie('refresh_token', data.refresh_token, {
              httpOnly: true,
              path: '/',
              sameSite: 'strict',
              secure: HTTP === 'https'
            })
        }
      } catch (e: any) {
        request.log.error('Failed to parse auth response: ', e);
        return reply.code(502).send({ success: false, message: 'Invalid response from authentication service' });
      }
    }
  });

  const http2 = HTTP === 'https';

  fastify.register(proxy, {
    upstream: USER_URL,
    prefix: '/user',
    http2: false
  });

  fastify.register(proxy, {
    upstream: AUTH_URL,
    prefix: '/auth',
    http2: false
  });

  fastify.register(proxy, {
    upstream: GAME_STATS_URL,
    prefix: '/stats',
    http2: false
  })

  fastify.register(healthRoutes, {
    prefix: "/health"
  });

  const shutdown = async () => {
    fastify.log.info('Shutting down gracefully...');
    await fastify.close();
    process.exit(0);
  };
  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);

  try {
    await fastify.listen({ port: 3000, host: '0.0.0.0' });
  } catch (err: any) {
    fastify.log.error(err);
    process.exit(1);
  }
}

startApiGateway();
