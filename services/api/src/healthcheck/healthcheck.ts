import { FastifyInstance } from "fastify";

interface HealthResponse {
  serviceName: string,
  status: string
}

async function checkUserServiceHealth(): Promise<HealthResponse> {
  const response = await fetch(`${process.env.USER_API_URL!}/health`);

  const json = await response.json();

  return { serviceName: 'userService', status: json.status };
}

export async function healthRoutes(fastify: FastifyInstance) {
  fastify.get("/", async (request, reply) => {
    const healthChecks: Promise<HealthResponse>[] = [];
    const unhealthyServices: HealthResponse[] = [];
    healthChecks.push(checkUserServiceHealth());
    const result = await Promise.all(healthChecks)
    for (const res of result) {
      if (res.status !== 'healthy')
        unhealthyServices.push(res);
    }
    if (unhealthyServices.length > 0) {
      return reply.status(500).send({ message: `Unhealthy Services: ${unhealthyServices.map(h => h.serviceName).join(',')}` });
    }
    return reply.status(200).send({ message: "All services Healthy" });
  })
}
