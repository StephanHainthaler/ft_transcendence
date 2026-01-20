import Fastify, { FastifyInstance, FastifyServerOptions } from "fastify";
import { initDB } from './database';
import { registerHealthRoute } from './health';
import { gameStatsRoutes } from './routes';

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3001;
const HOST = process.env.HOST ? process.env.HOST : "0.0.0.0";

function getErrorMessage(e: unknown): string {
	if (e instanceof Error)
		return e.message;
	if (typeof e === 'string')
		return e;
	return 'An unknown server exception occurred.';
}

export function buildApp(dbPath?: string, options?: FastifyServerOptions): FastifyInstance {
	initDB(dbPath || './db/game_stats.db');

	const server = Fastify({ logger: true, ...options });

	server.setErrorHandler((error, request, reply) => {
		const statusCode = (error as any).statusCode || 500;
		const errorMessage = getErrorMessage(error);
		if (statusCode >= 500) {
			request.log.error(error, `GLOBAL SERVER ERROR: ${errorMessage}`);
			return reply.code(500).send({
				success: false,
				message: 'Internal Server Error',
			});
		} else {
			request.log.warn(`Global Error (Client/Fastify): ${errorMessage}`);
			return reply.code(statusCode).send({
				success: false,
				message: errorMessage,
			});
		}
	});

	server.register(registerHealthRoute);
	server.register(gameStatsRoutes, { prefix: '/api/v1/stats' });

	return server;
}

async function start() {
	try {
		const server = buildApp('./db/game_stats.db');
		await server.listen({ port: PORT, host: HOST });
		server.log.info(`Server listening on ${HOST}:${PORT}`);
	} catch (err) {
		console.error(err);
		process.exit(1);
	}
}

start();
