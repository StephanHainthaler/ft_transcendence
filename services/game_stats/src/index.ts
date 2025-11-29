import Fastify from "fastify";
import { initDB } from './database'; 
import { ApiError } from '@server/error/apiError';
import { registerHealthRoute } from './health';
import { gameStatsRoutes } from './routes';

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3001; 
const HOST = process.env.HOST ? process.env.HOST : "0.0.0.0";

const server = Fastify({ logger: true, });

async function start()
{
	try {
		// Initializing the database
		initDB('./db/game_stats.db'); 

		server.setErrorHandler((error, request, reply) =>
		{
			if (error instanceof ApiError)
				reply.code(error.code).send({ error: error.message });
			else
				reply.code(500).send({ error: 'Internal Server Error' });
		});
		
		// Register Health Check
		server.register(registerHealthRoute);

		server.register(gameStatsRoutes, { prefix: '/api/v1/stats' });

		// Start the server
		await server.listen({ port: PORT, host: HOST });
		server.log.info(`Server listening on ${HOST}:${PORT}`);
		
	} catch (err) {
		server.log.error(err);
		process.exit(1);
	}
}

start();