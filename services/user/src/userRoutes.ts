import { FastifyInstance } from "fastify";
import { db } from "./db";
import { Avatar, User } from "@shared/user"
import { extractJWTFromHeader } from "@server/jwt/validate";
import { IN } from "@server/orm";
import { ApiError } from "@server/error/apiError";
import { validateDisplayName, validateAvatarMimeType, validateAvatarSize } from "@shared/validation";
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
  }>('/:userId?', async (request, reply) => {
    try {
      let token_sub;
      if (request.cookies.access_token) {
        const token = extractJWTFromHeader(request.cookies.access_token);
        token_sub = token.payload.sub;
      } else if (request.params.userId) {
        token_sub = request.params.userId;
      } else {
        throw new ApiError({ code: 404, 'message': "User not found" });
      }
      try {
        const { user, avatar } = getUser(token_sub);
        if (!user) {
          return reply.status(404).send({ success: false, message: "No such user" })
        } else {
          return reply.status(200).send({ success: true, user, avatar });
        }
      } catch (e: any) {
        throw new ApiError({ message: `Database Error: ${e.message || e}`, code: 409 })
      }
    } catch (e: any) {
      return reply.code(e.code || 400).send({ success: false, message: e.message || 'Missing Auth Token' })
    }
  });

  fastify.post<{
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
      const nameErr = validateDisplayName(user.name);
      if (nameErr) throw new ApiError({ code: 400, message: nameErr });
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
        if (part.type === 'file' && part.fieldname === 'avatar') {
          const mimeErr = validateAvatarMimeType(part.mimetype);
          if (mimeErr) throw new ApiError({ code: 400, message: mimeErr });
          avatarBuffer = await part.toBuffer();
          const sizeErr = validateAvatarSize(avatarBuffer.length);
          if (sizeErr) throw new ApiError({ code: 413, message: sizeErr });
          avatarMimetype = part.mimetype;
        } else if (part.type === 'field' && part.fieldname === 'user') {
          user = JSON.parse(part.value as string);
          if (user?.name) {
            const nameErr = validateDisplayName(user.name);
            if (nameErr) throw new ApiError({ code: 400, message: nameErr });
          }
        }
      }

      if (!user) throw new ApiError({ code: 400, message: 'Missing user form data' });

      const avatarData = avatarBuffer && avatarMimetype ? { buffer: avatarBuffer, mimetype: avatarMimetype } : null;
      const data = await updateUser(token.payload.sub, user, avatarData);

      if (!data)
        throw new ApiError({ code: 404, message: 'User not found' });

      reply.status(200).send({ success: true, user: data.user, avatar: data.avatar });
    } catch(e: any) {
      reply.status(e.code || e.statusCode || 400).send({ success: false, message: e.message || 'Bad Request' })
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
        const token = extractJWTFromHeader(req.cookies.access_token);
        await deleteUser(token.payload.sub);
        repl.code(200).send({ success: true });
      } catch (e: any) {
        repl.code(e.code || 400).send({ success: false, message: e.message || 'Bad Request' });
      }
  })
}
