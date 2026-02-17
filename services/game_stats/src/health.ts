import { FastifyInstance } from "fastify";

async function handleHealthCheck()
{
	return { status: "healthy" };
}

export async function registerHealthRoute(app: FastifyInstance)
{
	app.get("/health", handleHealthCheck);
}

// export async function registerHealthRoute(app: FastifyInstance) {
//     app.get("/health", async () => {
//         return { status: "ok" };
//     });
// }
