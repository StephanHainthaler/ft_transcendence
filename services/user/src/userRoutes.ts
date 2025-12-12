import { FastifyInstance } from "fastify";
import { db } from "./db";
import { Avatar, User } from "@shared/user"
import { extractJWTFromHeader } from "@server/jwt/validate";
import { IN } from "@server/orm";
import { ApiError } from "@server/error/apiError";
import { createUser, getAllUsers, getUser, updateUser } from "./dbHandlers";
import { MultipartFile } from "@fastify/multipart";

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
      200: { success: true, user: User },
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

      const data = createUser(user);

      if (!data) throw new ApiError({ message: "Failed to insert User", code: 400 });
      reply.status(200).send({ success: true, user: data.user });
    } catch (e: any) {
      reply.status(e.code || e.status || 500).send({ success: false, message: e.message || e })
    }
  });

  fastify.get<{
    Reply: {
      200: { success: boolean, users: { user: User, avatar: Avatar | null }[] },
      '4xx': { success: boolean, message: string },
      500: { success: boolean, message: string }
    }
  }>('/all', (_, reply) => {
      try {
        const users = getAllUsers();

        reply.status(200).send({ success: true, users });
      } catch (e: any) {
        reply.status(e.code || e.status || 500).send({ success: false, message: e.message || `Internal Server Error: ${e}` })
      }
  })

  fastify.post<{
    Reply: {
      200: { success: true, user: User, avatar: Avatar | null },
      '4xx': Error,
      500: Error,
    }
  }>('/update', async (request, reply) => {
    try {
      const token = extractJWTFromHeader(request.headers.authorization);

      const parts = request.parts();
      let user: Partial<User> | undefined;
      let avatar: MultipartFile | undefined;

      for await (const part of parts) {
        console.log('Part:', part.fieldname, part.type);

        if (part.type === 'file' && part.fieldname === 'avatar') {
          avatar = part;
        } else if (part.type === 'field' && part.fieldname === 'user') {
          user = JSON.parse(part.value as string);
        }
      }

      console.log('Final user:', user);
      console.log('Final avatar:', avatar);

      if (!user) throw new ApiError({ code: 400, message: 'Missing user form data' });

      const data = await updateUser(token.payload.sub, user, avatar);

      if (!data)
        throw new Error('User update Failed');

      reply.status(200).send({ success: true, user: data.user, avatar: data.avatar });
    } catch(e: any) {
      reply.status(e.code || e.statuscode || 400).send(new Error(`Error ${e.message || e}`))
    }
  })
}
