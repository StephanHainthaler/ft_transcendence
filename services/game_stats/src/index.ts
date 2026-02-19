import { initDB } from './database';
import { registerHealthRoute } from './health';
import { gameStatsRoutes } from './routes';
import { createServer } from "@server/fastify/createServer";

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3001;
const HOST = process.env.HOST ? process.env.HOST : "0.0.0.0";
const DB_PATH = process.env.DB_PATH;

const server = createServer();

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
    if (!DB_PATH) {
      throw new Error("Missing Database Path environment variable");
    }
	 	// Initializing the database
		initDB(DB_PATH);

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

		// Register routes with prefix /v1
		server.register(gameStatsRoutes, { prefix: '/v1' });

		const shutdown = async () => {
			server.log.info('Shutting down gracefully...');
			await server.close();
			process.exit(0);
		};
		process.on('SIGTERM', shutdown);
		process.on('SIGINT', shutdown);

		// Start the server
		await server.listen({ port: PORT, host: HOST });
		server.log.info(`Server listening on ${HOST}:${PORT}`);

	} catch (err) {
		server.log.error(err);
		process.exit(1);
	}
}

start();
