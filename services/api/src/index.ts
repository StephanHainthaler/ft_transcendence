import Fastify from 'fastify'
import { healthRoutes } from './healthcheck/healthcheck';

const AUTH_URL = process.env.AUTH_SERVICE_URL;

const USER_URL = process.env.USER_SERVICE_URL;

async function startApiGateway() {

  if (!AUTH_URL) throw new Error("AUTH_SERVICE_URL is not defined");
  if (!USER_URL) throw new Error("USER_SERVICE_URL is not defined");

  const fastify = Fastify({
    logger: {
      level: 'info',
      transport: {
        target: 'pino-pretty'
      },
    },
    disableRequestLogging: true
 });

  const proxy = await import ('@fastify/http-proxy');

  console.log(`API_URL: ${process.env.API_URL}`);

  fastify.register(proxy, {
    upstream: USER_URL,
    prefix: '/user',
    http2: false,
  })

  fastify.register(proxy, {
    upstream: AUTH_URL,
    prefix: '/auth',
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
