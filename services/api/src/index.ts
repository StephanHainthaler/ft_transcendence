import Fastify from 'fastify'
import { healthRoutes } from './healthcheck/healthcheck';
import { userRoutes } from './user/userService';

const fastify = Fastify({ logger: true });

console.log(`API_URL: ${process.env.API_URL}`);

fastify.register(userRoutes, {
  prefix: "/user"
})

fastify.register(healthRoutes, {
  prefix: "/health"
});

fastify.get("/api/ping", async () => {
  return "pong";
})

fastify.get("/api/", async () => {
  return { hello: "world" };
})

const start = async () => {
  try {
    await fastify.listen({ port: 3000, host: '0.0.0.0' });
  } catch (err: any) {
    fastify.log.error(err);
    process.exit(1);
  }
}

start();
