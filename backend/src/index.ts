import Fastify from 'fastify'

const fastify = Fastify({ logger: true });

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
