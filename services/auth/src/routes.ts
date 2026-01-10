import { FastifyInstance } from "fastify";
import { createSession, createAuthUser, getAuthUser, updateUserCredentials, verifyUserCredentials, getSession, getAuthUserClient } from "./dbHandlers";
import { updateUser } from "@ft_transcendence/user/src/api";
import { AuthUserClient, } from "@shared/user";
import { type Redirect, type SignupRequestBody, type ErrorResponse, type LoginRequestBody, type AuthResponseSuccess, type UpdateCredsRequestBody } from "@shared/api";
import { AuthUser } from "./db";
import { generateJWT, generateRefreshTokenCookie, validateJWT, validateRefreshToken } from "./jwt";
import { extractJWTFromHeader } from "@server/jwt/validate";
import { setupTotp, enableTotp, verifyTotp, is2FAEnabled } from "./totpHandlers";

type AuthReply = {
  200: AuthResponseSuccess,
  302: Redirect,
  '4xx': ErrorResponse
  500: ErrorResponse
}

const secret = '1234';

export function authRoutes(fastify: FastifyInstance) {
  fastify.get<{
    Reply: AuthReply
  }>('/:userId?', async (req, repl) => {
      try {
        const token = extractJWTFromHeader(req.headers.authorization);
        const authUser = getAuthUser({ userId: token.payload.sub });
        if (!authUser) throw { status: 400, message: 'No Such User' };

        const authUserClient: AuthUserClient = {
          email: authUser.email,
          username: authUser.user_name
        };
        return repl.status(200).send({ success: true, auth: authUserClient });
      } catch (e: any) {
        return repl.code(e.status || 500).send(e.message || e || 'Internal server error');
      }
  })

  fastify.post<{
    Reply: AuthReply
  }>('/refresh', async (request, reply) => {
      const cookieHeader = request.headers.cookie;
      if (!cookieHeader) return reply.code(401).send({ success: false, message: 'Missing Cookie' });

      let cookies;
      try {
        const cookiesRaw = cookieHeader.split('; ').map(c => c.split('='));
        cookies = Object.fromEntries(cookiesRaw);
      } catch (e: any) {
        return reply.code(400).send({ success: false, message: 'Invalid cookie format' });
      }

      const refresh_token = cookies.refresh_token;
      try {
        const session = getSession({ token: refresh_token });
        validateRefreshToken({ id: session.auth_id }, refresh_token);
        const token = generateJWT({ id: session.user_id }, secret);

        const auth = getAuthUserClient({ authId: session.auth_id });
        if (!auth) return reply.code(401).send({ success: false, message: 'Invalid User information' });

        return reply.status(200).send({ success: true, auth, access_token: token.raw })
      } catch (e: any) {
        console.error('Error in refresh:', e);
        return reply.status(401).send({ success: false, message: 'Invalid Token' });
      }
  })

  fastify.post<{
    Reply: {
      200: { success: boolean },
      '4xx': { success: boolean, message: string },
      500: { success: boolean, message: string }
    }
  }>('/validate', (request, reply) => {
      try {
        const token = extractJWTFromHeader(request.headers.authorization);
        validateJWT(token, secret);
      } catch (e: any) {
        console.error(e);
        reply.code(401).send({ success: false, message: e.message || 'Invalid Token' });
        return ;
      }
      reply.code(200).send({ success: true })
      return ;
  });

  fastify.post <{
    Body: LoginRequestBody & { totp_token?: string },
    Reply: AuthReply & { 202: { success: boolean, requires_2fa: boolean, message: string } },
  }>
  ('/login', async (request, reply) => {
      try {
        const { passwd, username, email, totp_token } = request.body;

        const requestAuthUser = { passwd, username, email };
        const verifiedAuthUser = await verifyUserCredentials(requestAuthUser);

        // Check if 2FA is enabled
        if (is2FAEnabled(verifiedAuthUser)) {
          if (!totp_token) {
            return reply.status(202).send({
              success: true,
              requires_2fa: true,
              message: '2FA verification required',
            });
          }

          if (!verifyTotp(verifiedAuthUser, totp_token)) {
            return reply.status(401).send({
              success: false,
              message: 'Invalid 2FA token',
            });
          }
        }

        const authUserClient: AuthUserClient = {
          username: verifiedAuthUser.user_name,
          email: verifiedAuthUser.email,
        };

        try {
          const session = createSession(verifiedAuthUser, secret);
          const refreshTokenCookie = generateRefreshTokenCookie(session.refreshToken);
          console.log("REFRESH_TOKEN_COOKIE", refreshTokenCookie)

          return reply.header('set-cookie', refreshTokenCookie).code(200).send({
            success: true,
            auth: authUserClient,
            access_token: session.accessToken.raw,
          });
        } catch (e: any) {
          console.error(e);
          return reply.code(e.code || 500).send({ success: false, message: e.message || e });
        }
      } catch (e: any) {
        console.error(e);
        return reply.status(401).send({ success: false, message: 'Invalid user credentials' });
      }
  });

  fastify.post('/logout', (request, reply) => {
    try {
      const cookies = request;
      if (cookies)
        reply.status(200).header('set-cookie', `refresh_token=0; Max-Age=0; Path=/`).send()
      else
        return reply.status(400).send({ message: 'User not logged in' });
    } catch (e: any) {
      return reply.code(500).send({ success: false, message: `Internal server error: ${e}` })
    }
  });

  fastify.post<{
    Body: SignupRequestBody,
    Reply: AuthReply,
  }>('/sign-up', async (request, reply) => {
      try {
        const { passwd, username, email } = request.body;

        const authUser = getAuthUser({ username, email });
        if (authUser)
          return reply.status(400).send({ success: false, message: "Username or Email already taken" });

        const tempAuthUser: Partial<AuthUser> = { user_name: username, email };
        const { user, authUser: newAuthUser } = await createAuthUser({ ...tempAuthUser, passwd });

        try {
          const session = createSession(newAuthUser, secret);
          const refreshTokenCookie = generateRefreshTokenCookie(session.refreshToken)
          const authUserClient: AuthUserClient = {
            email: newAuthUser.email,
            username: newAuthUser.email,
          }

          return reply.header('set-cookie', refreshTokenCookie).code(200).send({
            success: true,
            user: user,
            auth: authUserClient,
            access_token: session.accessToken.raw,
          } as any);
        } catch (e: any) {
          console.error(e);
          return reply.code(500).send({ success: false, message: `Internal Server Error` });
        }
      } catch (e: any) {
        console.error(e);
        return reply.code(401).send({ success: false, message: JSON.stringify(e) })
      }
  });

  fastify.patch<{
    Body: UpdateCredsRequestBody,
    Reply: AuthReply,
  }>('/update', async (request, reply) => {
      const { email, username, passwd } = request.body;

      try {
        const authUser = getAuthUser({ email, username });
        if (!authUser) return reply.status(401).send({ success: false, message: "No such User" });

        const newAuth = {
          id: authUser.id,
          passwd,
          email,
          username,
        }

        const newUser = updateUserCredentials(newAuth);
        await updateUser({ email, id: authUser.user_id });
        if (!newUser)
          throw new Error("Failed to update database");
        reply.code(200).send({ success: true, auth: {
          email: newUser.email, username: newUser.user_name }
        });
      } catch (e: any) {
        reply.status(500).send({ success: false, message: `${e.message || e}` })
      }
  })

  // 2FA routes

  // setup 2FA - generates secret and QR code
  fastify.post<{
    Reply: {
      200: { success: boolean, secret: string, qrCodeUrl: string },
      '4xx': ErrorResponse,
      500: ErrorResponse
    }
  }>('/2fa/setup', async (request, reply) => {
    try {
      const token = extractJWTFromHeader(request.headers.authorization);
      const authUser = getAuthUser({ userId: token.payload.sub });
      if (!authUser) return reply.status(401).send({ success: false, message: 'User not found' });
      if (is2FAEnabled(authUser)) return reply.status(400).send({ success: false, message: '2FA already enabled' });

      const setup = await setupTotp(authUser);
      return reply.status(200).send({ success: true, ...setup });
    } catch (e: any) {
      return reply.status(500).send({ success: false, message: e.message || 'Internal server error' });
    }
  });

  // verify and enable 2FA
  fastify.post<{
    Body: { token: string },
    Reply: {
      200: { success: boolean, message: string },
      '4xx': ErrorResponse,
      500: ErrorResponse
    }
  }>('/2fa/enable', async (request, reply) => {
    try {
      const jwtToken = extractJWTFromHeader(request.headers.authorization);
      const authUser = getAuthUser({ userId: jwtToken.payload.sub });
      if (!authUser) return reply.status(401).send({ success: false, message: 'User not found' });

      const { token } = request.body;
      if (!token) return reply.status(400).send({ success: false, message: 'TOTP token required' });

      if (!enableTotp(authUser, token)) {
        return reply.status(400).send({ success: false, message: 'Invalid TOTP token' });
      }
      return reply.status(200).send({ success: true, message: '2FA enabled successfully' });
    } catch (e: any) {
      return reply.status(500).send({ success: false, message: e.message || 'Internal server error' });
    }
  });
}
