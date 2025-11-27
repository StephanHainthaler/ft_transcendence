import Fastify from "fastify";
import { initDB } from './database'; 
// import statsRoutes from './routes'; 
import { registerHealthRoute } from './health';

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3001; 
const HOST = process.env.HOST ? process.env.HOST : "0.0.0.0";


const server = Fastify({
	logger: true,
});

async function start() {
	try {
		// 1. Initializing the database
		initDB('./db/game_stats.db'); 
		
		// 2. Register Health Check
		server.register(registerHealthRoute);

		//server.register(statsRoutes, { prefix: '/api/v1/stats' });

		// 4. Start the server
		await server.listen({ port: PORT, host: HOST });
		server.log.info(`Server listening on ${HOST}:${PORT}`);
		
	} catch (err) {
		server.log.error(err);
		process.exit(1);
	}
}

start();