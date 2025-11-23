import { FastifyInstance } from "fastify";

export function healthRoute(fastify: FastifyInstance) {
  fastify.get('/health', (request, reply) => {
    reply.status(200).send({ status: 'healthy' });
  });
}
