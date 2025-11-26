import { FastifyInstance, FastifyRequest } from "fastify";
import { db } from "./db";
import { User } from "@shared/user"
import { extractJWTFromHeader } from "@server/jwt/validate";
import { eq, } from "@server/orm";

type CreateUserReq = FastifyRequest<{
  Body: {
    user: User
  },
}>

export function userRoutes(fastify: FastifyInstance) {
  fastify.get<{
    Params: {
      userId?: number,
    }
  }>('/:userId?', (request, reply) => {
    try {
      const token = extractJWTFromHeader(request.headers.authorization);
      const user = db
        .from('users')
        .select('*')
        .where(eq('id', token.payload.sub))
        .single();
      if (!user) {
        return reply.status(400).send({ message: "No such user" })
      }
      return reply.status(200).send({ user });
    } catch (e: any) {
      return reply.code(e.code || 500).send({ success: false, message: e.message || 'Unauthorized'})
    }
  });

  fastify.post('/new', (request: CreateUserReq, reply) => {
    const { user } = request.body;
    const result = db
      .from('users')
      .insert(user)
      .select('id')
      .single();

    if (!result) throw new Error("Failed to insert User");
    reply.status(200).send({ id: result.id })
  });

  fastify.get<{
    Reply: {
      200: { success: boolean, users: User[] },
      '4xx': { success: boolean, message: string },
      500: { success: boolean, message: string }
    }
  }>('/all', (request, reply) => {
      try {
        const users = db
          .from('users')
          .select('*')
          .all();

        reply.status(200).send({ success: true, users });
      } catch (e: any) {
        reply.status(e.code || e.status || 500).send({ success: false, message: e.message || `Internal Server Error: ${e}` })
      }
  })

  fastify.patch<{
    Body: {
      user: User,
    },
    Params: {
      userId: number,
    }
    Reply: {
      200: User,
      '4xx': Error,
      500: Error,
    }
  }>('/update/:userId?', (request, reply) => {
    const { user } = request.body;
    const userId = request.params.userId;
    if (userId) user.id = userId;

    try {
      const response = db
        .from('users')
        .update(user)
        .where(eq('id', user.id))
        .select('*')
        .single();

      if (!response)
        throw new Error('User update Failed');

      reply.status(200).send(response);
    } catch(e: any) {
      reply.status(500).send(new Error(`Error ${e.message || e}`))
    }
  })
}
