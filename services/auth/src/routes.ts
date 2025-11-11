import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { createAuthUser, getAuthUser, verifyUserCredentials } from "./dbHandlers";
import { AuthUser } from "./db";
import { getUser } from "@ft_transcendence/user/src/api";
import { User } from "@shared/user";

interface UserReply {
  200: { success: boolean, user: User },
  302: { url: string },
  '4xx': { error: string }
}

interface SignInReq {
  passwd: string,
  username?: string,
  email?: string,
}

interface SignUpReq {
  passwd: string,
  username?: string,
  email?: string,
}

interface LogInReq {
  passwd: string,
  email?: string,
  username?: string
}

const SESSION_COOKIE = `logged-in=1; HttpOnly; domain=http://localhost:8080; path=/`;

export function authRoutes(fastify: FastifyInstance) {
  fastify.get<{
  }>('/validate', (request, reply) => {
    console.log(request.headers.cookie)
  });

  fastify.post <{
    Body: SignInReq,
    Reply: UserReply,
  }>
  ('/login', async (request, reply) => {
    const { passwd, username, email } = request.body;

    const requestAuthUser = { passwd, username, email };
    const verifiedAuthUser = verifyUserCredentials(requestAuthUser);

    const replyUser = await getUser(verifiedAuthUser.user_id);

    const replyCookie = SESSION_COOKIE;

    return reply.header('set-cookie', replyCookie).code(200).send({ success: true, user: replyUser });
  });

  fastify.post('/logout', (request, reply) => {
    const cookies = request;
    if (cookies)
      reply.status(200).header('set-cookie', `logged-in=0`).send()
    else
      return reply.status(400).send({ message: 'User not logged in' });
  });

  fastify.post<{
    Body: SignUpReq,
    Reply: UserReply,
  }>('/sign-up', async (request, reply) => {
    const { passwd, username, email } = request.body;

    const authUser = getAuthUser({ userName: username, email });
    if (!authUser) return reply.status(400).send({ error: "Username already taken" });

    const { user } = await createAuthUser({ ...authUser, passwd });

    const replyCookie = SESSION_COOKIE;

    return reply.header('set-cookie', replyCookie).code(200).send({ success: true, user });
  });
}
