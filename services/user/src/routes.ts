import { FastifyInstance, FastifyRequest } from "fastify";
import { db } from "./db";
import { User } from "@shared/user"

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

export async function userRoutes(fastify: FastifyInstance) {
  fastify.get('/:userId', (request: GetUserIdReq, reply) => {
    const { userId } = request.params;
    const user = db
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();
    if (!user) {
      return reply.status(400).send({ message: "No such user" })
    }
    return reply.status(200).send({ user });
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

  fastify.patch('/update/:userId?', (request: UpdateUserReq, reply) => {
    const { user } = request.body;
    const userId = request.params.userId;
    if (userId) user.id = userId;

    const response = db
      .from('users')
      .update(user)
      .eq('id', user.id)
      .select('*')
      .get();

    reply.status(200).send({ user: response });
  })
}
