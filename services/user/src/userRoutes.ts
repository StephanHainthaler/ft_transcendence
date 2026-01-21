import { FastifyInstance } from "fastify";
import { db } from "./db";
import { Avatar, User } from "@shared/user"
import { extractJWTFromHeader } from "@server/jwt/validate";
import { eq, IN } from "@server/orm";
import { ApiError } from "@server/error/apiError";
import { createUser, deleteUser, getAllUsers, getUser, updateUser } from "./dbHandlers";

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
      const token = extractJWTFromHeader(request.cookies.access_token);
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
      reply.code(e.code || 400).send({ success: false, message: e.message || 'Missing Auth Token'})
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
  });

  fastify.post<{
    Reply: {
      200: { success: true, user: Partial<User>, avatar: Avatar | null },
      '4xx': { success: false, message: string },
      500: { success: false, message: string }
    },
    Body: {
      user: User,
      oauthAvatarUrl: string,
    }
  }>('/new', async (request, reply) => {
    try {
      const { user, oauthAvatarUrl } = request.body;
      const { user: newUser, avatar } = await createUser(user, oauthAvatarUrl);

      reply.status(200).send({ success: true, user: newUser, avatar });
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
    Body: {
      user: User,
    },
    Params: {
      userId: number,
    }
    Reply: {
      200: { success: true, user: User, avatar: Avatar | null },
      '4xx': { success: false, message: string },
      500: { success: false, message: string },
    }
  }>('/update', async (request, reply) => {
    try {
      const token = extractJWTFromHeader(request.cookies.access_token);

      const parts = request.parts();
      let user: Partial<User> | undefined;
      let avatarBuffer: Buffer | undefined;
      let avatarMimetype: string | undefined;

      for await (const part of parts) {
        console.log('Part:', part.fieldname, part.type);

        if (part.type === 'file' && part.fieldname === 'avatar') {
          avatarBuffer = await part.toBuffer();
          avatarMimetype = part.mimetype;
        } else if (part.type === 'field' && part.fieldname === 'user') {
          user = JSON.parse(part.value as string);
          console.log(user);
        }
      }

      console.log('Final user:', user);
      console.log('Final avatar:', avatarBuffer);

      if (!user) throw new ApiError({ code: 400, message: 'Missing user form data' });

      const avatarData = avatarBuffer && avatarMimetype ? { buffer: avatarBuffer, mimetype: avatarMimetype } : null;
      const data = await updateUser(token.payload.sub, user, avatarData);

      if (!data)
        throw new ApiError({ code: 404, message: 'User not found' });

      const response = db
        .from('users')
        .update(user)
        .where(eq('id', user.id))
        .select('*')
        .single();

      if (!response)
        throw new Error('User update Failed');

      reply.status(200).send({ success: true, user: data.user, avatar: data.avatar });
    } catch(e: any) {
      reply.status(e.code || e.statuscode || 400).send({ success: false, message: e.message || 'Bad Request' })
    }
  });

  fastify.delete<{
    Reply: {
      200: { success: true },
      '4xx': { success: false, message: string },
      500: { success: false, message: string },
    }
  }>('/delete', async (req, repl) => {
      try {
        console.log('got delete request');
        const token = extractJWTFromHeader(req.cookies.access_token);
        await deleteUser(token.payload.sub);
        repl.code(200).send({ success: true });
      } catch (e: any) {
        repl.code(e.code || 400).send({ success: false, message: e.message || 'Bad Request' });
      }
  })
}
