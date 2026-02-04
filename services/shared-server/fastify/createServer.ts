import Fastify, { FastifyServerOptions } from "fastify";

export function createServer(options?: FastifyServerOptions) {
  return Fastify({
    logger: {
      transport: {
        target: 'pino-pretty'
      },
    },
    disableRequestLogging: true,
    ...options
  });
}
