import { FastifyInstance } from "fastify";

export function userRoutes(fastify: FastifyInstance) {
  fastify.get('/', (request, reply) => {
    reply.code(200).send({ success: true, hello: 'world' })
  })
}
