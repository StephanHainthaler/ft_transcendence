import { FastifyInstance, FastifyRequest } from "fastify";
import { db } from "./db";
import { User } from "@shared/user"
import { JWT, parseJWT } from '@shared/api';

type GetUserIdReq = FastifyRequest<{
  Params: {
    userId: string,
  }
}>

type CreateUserReq = FastifyRequest<{
  Body: {
    user: User
  },
}>

type UpdateUserReq = FastifyRequest<{
  Body: {
    user: User
  },
  Params: {
    userId: number | undefined,
  }
}>

export function parseJWTUserService(tokenHeader: string | undefined, userId?: number): JWT {
    if (!tokenHeader || !tokenHeader.startsWith('Bearer '))
      throw { code: 500, message: 'Internal Server Error: Unauthorized' };
    const tokenRaw = tokenHeader.replace('Bearer ', '');
    const token = parseJWT(tokenRaw);

    if (userId && userId !== token.payload.sub) {
      throw { code: 403, message: 'Forbidden' };
    }
    return token;
}

export function userRoutes(fastify: FastifyInstance) {
  fastify.get<{
    Params: {
      userId?: number,
    }
  }>('/:userId?', (request, reply) => {
    try {
      const token = parseJWTUserService(request.headers.authorization, request.params.userId);
      const user = db
        .from('users')
        .select('*')
        .eq('id', token.payload.sub)
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

  fastify.get('/all', (request, reply) => {
    const users = db
      .from('users')
      .select('*')
      .all();

    reply.status(200).send({ users });
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
        .eq('id', user.id)
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
