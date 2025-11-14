import { FastifyInstance } from "fastify";
import { createAuthUser, getAuthUser, verifyUserCredentials } from "./dbHandlers";
import { getUser } from "@ft_transcendence/user/src/api";
import { User } from "@shared/user";
import { AuthUser } from "./db";

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

    console.log('request body', request.body);
    console.log(`passwd: ${passwd}\nusername: ${username}\nemail: ${email}`);

    const requestAuthUser = { passwd, username, email };
    const verifiedAuthUser = await verifyUserCredentials(requestAuthUser);

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

    const authUser = getAuthUser({ username, email });
    if (authUser) return reply.status(400).send({ error: "Username already taken" });

    const newAuthUser: Partial<AuthUser> = { user_name: username, email };

    const { user } = await createAuthUser({ ...newAuthUser, passwd });

    const replyCookie = SESSION_COOKIE;

    return reply.header('set-cookie', replyCookie).code(200).send({ success: true, user });
  });
}
