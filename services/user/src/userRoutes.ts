import { FastifyInstance } from "fastify";
import { db } from "./db";
import { Avatar, User } from "@shared/user"
import { extractJWTFromHeader } from "@server/jwt/validate";
import { eq, IN, } from "@server/orm";
import { ApiError } from "@server/error/apiError";
import { getUser } from "./dbHandlers";

export function userRoutes(fastify: FastifyInstance) {
  fastify.get<{
    Reply: {
      200: { success: true, user: User, avatar: Avatar | null },
      '4xx': { success: false, message: string },
      500: { success: false, message: string }
    },
    Params: {
      userId?: number,
    }
  }>('/:userId?', (request, reply) => {
    try {
      const token = extractJWTFromHeader(request.headers.authorization);
      try {
        const { user, avatar } = getUser(token.payload.sub);
        if (!user) {
          reply.status(404).send({ success: false, message: "No such user" })
        } else {
          reply.status(200).send({ success: true, user, avatar });
        }
      } catch (e: any) {
        throw new ApiError({ message: `Database Error: ${e.message || e}`, code: 409 })
      }
    } catch (e: any) {
      reply.code(e.code || 500).send({ success: false, message: e.message || 'Unauthorized'})
    }
  });

  fastify.get<{
    Body: {
      usersId: number[]
    },
    Reply: {
      200: { success: true, users: User[] };
      '4xx': { success: false, message: string };
      500: { success: false, message: string };
    }
  }>('/users', (req, repl) => {
    try {
      const { usersId } = req.body;
      if (!usersId) throw new ApiError({ code: 400, message: 'missing user ids in body' });
      const users = db.from('users').select('*').where(IN('id', usersId)).get();
      if (!users) throw new ApiError({ code: 400, message: 'invalid user ids'});

      repl.code(200).send({ success: true, users });
    } catch (e: any) {
      repl.code(e.code || 500).send({ success: false, message: e.message || `Internal server Error ${e}` });
    }
  })

  fastify.post<{
    Reply: {
      200: { success: true, user: Partial<User> },
      '4xx': { success: false, message: string },
      500: { success: false, message: string }
    },
    Body: {
      user: User,
    }
  }>
    ('/new', (request, reply) => {
    try {
      const { user } = request.body;
      const result = db
        .from('users')
        .insert(user)
        .select('id')
        .single();

      if (!result) throw new ApiError({ message: "Failed to insert User", code: 400 });
      reply.status(200).send({ success: true, user: result })
    } catch (e: any) {
      reply.status(e.code || e.status || 500).send({ success: false, message: e.message || e })
    }
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
    Reply: {
      200: User,
      '4xx': Error,
      500: Error,
    }
  }>('/update', (request, reply) => {
    try {
      const { user } = request.body;
      const token = extractJWTFromHeader(request.headers.authorization);
      const userId = request.params.userId;
      if (userId) user.id = userId;

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
