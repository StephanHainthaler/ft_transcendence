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
];

async function startApiGateway() {

  if (!AUTH_URL) throw new Error("AUTH_SERVICE_URL is not defined");
  if (!USER_URL) throw new Error("USER_SERVICE_URL is not defined");
  if (!GAME_STATS_URL) throw new Error("GAME_STATS_SERVICE_URL is not defined");

  console.log(AUTH_URL);

  const fastify = createServer();

  fastify.register(fastifyCookie);

  const proxy = await import ('@fastify/http-proxy');
  console.log('auth url in api services: ', AUTH_URL);

  fastify.addHook('onRequest', async (request, reply) => {
    request.log.info(`REQUEST WITH URL ${request.originalUrl}`);
    if (!publicRoutes.some(r => request.url.includes(r))) {
      try {
        const authReqUrl = `${AUTH_URL}/validate`;
        console.log("Trying validate req with:", authReqUrl);
        const response = await fetch(authReqUrl, {
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
        console.log('Caught error: ', e);
        request.log.error('Failed to validate: ', e);
        return reply.code(401).send({ success: false, message: 'You are not authenticated' });
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
