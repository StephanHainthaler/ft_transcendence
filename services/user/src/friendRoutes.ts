import { FastifyInstance } from "fastify";
import { extractJWTFromHeader } from "@server/jwt/validate";
import { Avatar, Friendship, User } from "@shared/user";
import { db } from "./db";
import { eq } from "@server/orm";
import { ApiError } from "@server/error/apiError";
import { getUsers } from "./dbHandlers";
import { AUTH_URL } from "./";

function safeParseInt(value: any, name: string, min: number = 0): number {
  const nb = parseInt(value);
  if (isNaN(nb) || nb < min)
    throw new ApiError({ code: 400, message: `Invalid parameter: ${name}` });
  return nb;
}

const getFriendships = (userId: number): { friends: { user: User, avatar: Avatar | null }[], friendships: Friendship[] } => {
  const friendships = db
    .from('friendships')
    .select('*')
    .where(eq('user_from_id', userId))
    .or(eq('user_to_id', userId))
    .all();

  const ids = [...friendships.map(f => f.user_from_id), ...friendships.map(f => f.user_to_id)];

  const friends = getUsers(ids);

  return { friends, friendships };
}

const registerFriendRequest = (fromId: number, toId: number) => {
  const existing = db.from('friendships').select('*').where(eq('user_from_id', fromId)).and(eq('user_to_id', toId)).single();
  if (existing)
    throw new ApiError({ code: 409, message: 'Request already exists' });
  console.log(`fromId: ${fromId}\ntoId: ${toId}`);
  return db.from('friendships').insert({ user_from_id: fromId, user_to_id: toId, status: 'pending' }).select('*').single();
}

const acceptFriendRequestFromReqId = (toId: number, reqId: number) => {
  const existing = db.from('friendships').select('*').where(eq('id', reqId)).and(eq('user_to_id', toId)).single();
  if (!existing)
    throw new ApiError({ code: 404, message: 'Request doesnt exist' });
  db.from('friendships').update({ status: 'accepted' }).where(eq('id', reqId)).and(eq('user_to_id', toId)).run();
}

const removeFriendship = (userId: number, reqId: number) => {
  const friendship = db.from('friendships').select('*').where(eq('id', reqId)).single();
  if (!friendship)
    throw new ApiError({ code: 404, message: 'Friendship not found' });
  if (friendship.user_from_id !== userId && friendship.user_to_id !== userId)
    throw new ApiError({ code: 403, message: 'Not authorized to remove this friendship' });
  db.from('friendships').delete().where(eq('id', reqId)).run();
}

export function friendRoutes(fastify: FastifyInstance) {
  fastify.get<{
    Reply: {
      200: { success: true, friends: { user: User, avatar: Avatar | null }[], friendships: Friendship[] },
      '4xx': { success: false, message: string },
      500: { success: false, message: string }
    }
  }>('/', (req, repl) => {
    try {
      const jwt = extractJWTFromHeader(req.cookies.access_token);
      const { friends, friendships } = getFriendships(jwt.payload.sub);
      repl.code(200).send({ success: true, friends, friendships });
    } catch (e: any) {
      console.error(e);
      if (typeof e.code === 'number') {
        repl.code(e.code).send({ success: false, message: e.message});
      } else {
        repl.code(500).send({ success: false, message: 'Internal Server Error' });
      }
    }
  })

  fastify.post<{
    Params: {
      toId: number,
    },
    Reply: {
      200: { success: true, friendship: Friendship },
      '4xx': { success: false, message: string },
      500: { success: false, message: string }
    }
  }>('/request/:toId', (req, repl) => {
    try {
      const jwt = extractJWTFromHeader(req.cookies.access_token);
      const toId = safeParseInt(req.params.toId, 'toId');
      const friendship = registerFriendRequest(jwt.payload.sub, toId);
      if (!friendship) throw new ApiError({ code: 500, message: 'Failed to create friendship' });
      repl.code(200).send({ success: true, friendship });
    } catch(e: any) {
      console.error(e);
      if (typeof e.code === 'number') {
        repl.code(e.code).send({ success: false, message: e.message });
      } else {
        repl.code(500).send({ success: false, message: `Internal Server Error ${e}` });
      }
    }
  })

  fastify.post<{
    Params: {
      reqId: number
    },
    Reply: {
      200: { success: true},
      '4xx': { success: false, message: string },
      500: { success: false, message: string }
    }
  }>('/accept/:reqId', (req, repl) => {
    try {
      const jwt = extractJWTFromHeader(req.cookies.access_token);
      const reqId = safeParseInt(req.params.reqId, 'reqId');
      acceptFriendRequestFromReqId(jwt.payload.sub, reqId);
      repl.code(200).send({ success: true })
    } catch (e: any) {
      console.error(e);
      if (typeof e.code === 'number') {
        repl.code(e.code).send({ success: false, message: e.message });
      } else {
        repl.code(500).send({ success: false, message: "Internal Server Error" });
      }
    }
  })

  fastify.delete<{
    Params: {
      reqId: number,
    },
    Reply: {
      200: { success: boolean };
      '4xx': { success: false, message: string };
      500: { success: false, message: string };
    }
  }>('/remove/:reqId', (req, repl) => {
    try {
      const jwt = extractJWTFromHeader(req.cookies.access_token);
      const reqId = safeParseInt(req.params.reqId, 'reqId');
      removeFriendship(jwt.payload.sub, reqId);
      repl.code(200).send({ success: true });
    } catch (e: any) {
      console.error(e);
      if (typeof e.code === 'number') {
        repl.code(e.code).send({ success: false, message: e.message || e });
      } else {
        repl.code(500).send({ success: false, message: 'Internal Server Error' });
      }
    }
  })

  fastify.get('/online', async (req, repl) => {
    try {
      const jwt = extractJWTFromHeader(req.cookies.access_token);
      const friendships = getFriendships(jwt.payload.sub);
      const friendsIds = friendships.friends.map(f => f.user.id);

      const response = await fetch(`${AUTH_URL}/sessions`, {
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ ids: friendsIds }),
        method: "POST"
      });

      const data = await response.json();
      return data;

    } catch (e: any) {
      console.error(e);
      if (typeof e.code === 'number') {
        repl.code(e.code).send({ success: false, message: e.message || e });
      } else {
        repl.code(500).send({ success: false, message: 'Internal Server Error' });
      }
    }
  })
}
