import Fastify from "fastify";
import { initDB } from './database'; 
import { registerHealthRoute } from './health';
import { gameStatsRoutes } from './routes';

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3001; 
const HOST = process.env.HOST ? process.env.HOST : "0.0.0.0";

const server = Fastify({ logger: true, });

function getErrorMessage(e: unknown): string {
	if (e instanceof Error)
		return e.message;
	if (typeof e === 'string')
		return e;
	return 'An unknown server exception occurred.';
}

async function start()
{
	try {
		// Initializing the database
		initDB('./db/game_stats.db');

		server.setErrorHandler((error, request, reply) =>
		{
			const statusCode = (error as any).statusCode || 500;
			const errorMessage = getErrorMessage(error);
			if (statusCode >= 500)
			{
				request.log.error(error, `GLOBAL SERVER ERROR: ${errorMessage}`);
				return reply.code(500).send({
          success: false,
          message: 'Internal Server Error', // 👈 Виправлення: завжди загальне повідомлення
        });
			}
			else
			{
				request.log.warn(`Global Error (Client/Fastify): ${errorMessage}`);
				return reply.code(statusCode).send({
						success: false,
						message: errorMessage,
				});
			}
		});
		
		// Register Health Check
		server.register(registerHealthRoute);

		server.register(gameStatsRoutes, { prefix: '/v1' });

		// Start the server
		await server.listen({ port: PORT, host: HOST });
		server.log.info(`Server listening on ${HOST}:${PORT}`);
		
	} catch (err) {
		server.log.error(err);
		process.exit(1);
	}
}

start();
