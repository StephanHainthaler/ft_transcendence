import { FastifyInstance } from "fastify";
import type { User } from "@shared/user/interfaces";

export async function userRoutes(fastify: FastifyInstance) {
  fastify.get("/get", async (request, reply): User => {
    return { name: "Victor" };
  })
}
