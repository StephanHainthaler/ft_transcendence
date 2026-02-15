import { FastifyInstance } from "fastify";
import { USER_URL, AUTH_URL, GAME_STATS_URL } from "./"
import { request } from "http";

interface HealthResponse {
  serviceName: string,
  status: string
}

interface HealthReply {
  200: { success: true },
  500: { success: false, message: "Internal Server Error" }
  503: { success: false, unhealthyServices: HealthResponse[] }
}

async function checkServiceHealth(url?: string): Promise<HealthResponse> {
  if (!url) throw new Error("Missing URL");

  let response;
  let json
  try {
    response = await fetch(`${url}/health`);
    json = await response.json();
  } catch (e) {
    return { serviceName: url, status: 'unhealty' };
  }

  return { serviceName: 'userService', status: json.status };
}

export async function healthRoutes(fastify: FastifyInstance) {
  fastify.get<{
    Reply: HealthReply
  }>("/", async (req, reply) => {
    try {
      const healthChecks: Promise<HealthResponse>[] = [
        checkServiceHealth(USER_URL),
        checkServiceHealth(AUTH_URL),
        checkServiceHealth(GAME_STATS_URL),
      ];
      const unhealthyServices: HealthResponse[] = [];

      const result = await Promise.all(healthChecks)
      for (const res of result) {
        if (res.status !== 'healthy')
          unhealthyServices.push(res);
      }
      if (unhealthyServices.length > 0) {
        return reply.status(503).send({ unhealthyServices, success: false });
      }
      return reply.status(200).send({ success: true });
    } catch (e) {
      req.log.error(e);
      return reply.code(500).send({ success: false, message: 'Internal Server Error' });
    }
  })
}
