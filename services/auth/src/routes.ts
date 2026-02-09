import { FastifyInstance } from "fastify";
import { createSession, createAuthUser, getAuthUser, updateUserCredentials, verifyUserCredentials, getSession, getAuthUserClient, deleteAuthUser, deleteSession } from "./dbHandlers";
import { deleteUser } from "@server/user/api";
import { AuthUserClient, } from "@shared/user";
import type { AuthDeleteRequest, AuthGetUserRequest, AuthLoginReply, AuthLogoutRequest, AuthOAuthRequest, AuthSignUpRequest, AuthUpdateRequest, AuthValidateRequest } from "@shared/api/authReply";
import { AuthUser } from "./db";
import { generateTokenCookie, validateJWT, validateRefreshToken } from "./jwt";
import { extractJWTFromHeader } from "@server/jwt/validate";
import { ApiError } from "@server/error/apiError";

const secret = process.env.AUTH_HMAC_SECRET!;

export function authRoutes(fastify: FastifyInstance) {
  fastify.get<AuthGetUserRequest>('/:userId?', async (req, repl) => {
    try {
      const token = extractJWTFromHeader(req.cookies.access_token);
      const authUser = getAuthUser({ userId: token.payload.sub });
      if (!authUser) throw new ApiError({ code: 400, message: 'No Such User' });

      const authUserClient: AuthUserClient = {
        email: authUser.email,
        user_name: authUser.user_name
      };
      return repl.status(200).send({ success: true, auth: authUserClient });
    } catch (e: any) {
      return repl.code(e.code || 400).send({ success: false, message: e.message || e });
    }
  })

  fastify.post<AuthValidateRequest>('/validate', async (request, reply) => {
    try {
      const token = extractJWTFromHeader(request.cookies.access_token);

      validateJWT(token, secret);
      return reply.code(200).send({ success: true });
    } catch (e) {
      const refresh_token = request.cookies.refresh_token;
      if (!refresh_token)
        throw new ApiError({ message: "Unauthenticated", code: 401 });

      try {
        const session = getSession({ token: refresh_token });
        if (!session) {
          throw new ApiError({ message: 'Unauthenticated', code: 401 });
        }

        validateRefreshToken({ id: session.user_id }, refresh_token);
        const authUser = getAuthUser({ userId: session.user_id });
        if (!authUser)
          return reply.code(400).send({ message: 'Invalid User', success: false });

        deleteSession({ authId: authUser.id });
        const newSession = createSession(authUser, secret);

        const auth = getAuthUserClient({ authId: authUser.id });
        if (!auth)
          return reply.code(401).send({ success: false, message: 'Invalid User information' });

        return reply
          .code(201)
          .send({
            success: true,
            access_token: newSession.accessToken.raw,
            refresh_token: newSession.refreshToken,
          });
      } catch (e: any) {
        request.log.error(e);
        return reply.status(401).send({ success: false, message: 'Unauthenticated' });
      }
    }
  });

  fastify.post<AuthLoginReply>
  ('/login', async (request, reply) => {
    try {
      const { passwd, user_name, email } = request.body;

      const requestAuthUser = { passwd, user_name, email };
      const verifiedAuthUser = await verifyUserCredentials(requestAuthUser);

      const authUserClient: AuthUserClient = {
        user_name: verifiedAuthUser.user_name,
        email: verifiedAuthUser.email,
      };

      try {
        const session = createSession(verifiedAuthUser, secret);

        return reply
          .setCookie("access_token", session.accessToken.raw, {
            httpOnly: true,
            path: '/',
            sameSite: 'strict',
            secure: 'auto'
          })
          .setCookie('refresh_token', session.refreshToken, {
            httpOnly: true,
            path: '/',
            sameSite: 'strict',
            secure: 'auto'
          })
          .code(200).send({
            success: true,
            auth: authUserClient,
          });

      } catch (e: any) {
        request.log.error(e);
        return reply.code(e.code).send({ success: false, message: e.message || e });
      }
    } catch (e: any) {
      request.log.error(e);
      return reply.status(401).send({ success: false, message: 'Invalid user credentials' });
    }
  });

  fastify.post<AuthLogoutRequest>('/logout', (request, reply) => {
    try {
      const cookies = request;
      if (cookies)
        reply
          .code(200)
          .clearCookie('refresh_token')
          .clearCookie('access_token')
          .send({ success: true });
      else
        reply.code(401).send({ success: false, message: 'User not logged in' });
    } catch (e: any) {
      request.log.error(e);
      reply.code(500).send({ success: false, message: `Internal server error` })
    }
  });

  fastify.post<AuthOAuthRequest>('/github-oauth', async (request, reply) => { // needs to return the access_token
    try {
      const { code } = request.body as { code?: string }; // stating receiving structure to be able to extract the value of code

      if (!code) {
        return reply.status(400).send({ success: false, message: "Error: Missing OAuth code" });
      }

      // Exchange code for access_token with GitHub
      const response = await fetch(`https://github.com/login/oauth/access_token`, {
        method: "POST",
        headers: { "Accept": "application/json" }, // define response type
        body: new URLSearchParams({
          client_id: process.env.GITHUB_APP_CLIENT_ID!, // stored in /env/.env.auth
          client_secret: process.env.GITHUB_APP_CLIENT_SECRET!, // stored in /env/.env.auth
          code,
          redirect_uri: `http://localhost:8080/`,
        }),
      });

      const response_data = await response.json();
      if (!response_data.access_token) {
        return reply.status(401).send({ success: false, message: 'Invalid OAuth code' });
      }

      // Now I can get user information from GitHub
      const user_response = await fetch("https://api.github.com/user", {
        headers: { Authorization: `Bearer ${response_data.access_token}`}, //, 'X-GitHub-Api-Version': '2022-11-28'},
      });
      const github_user = await user_response.json();

      if (!github_user.email) { // try to retrieve email from different endpoint
        const user_email_response = await fetch("https://api.github.com/user/emails", {
          headers: { Authorization: `Bearer ${response_data.access_token}`}, //, 'X-GitHub-Api-Version': '2022-11-28'},
        });
        const github_user_email = await user_email_response.json();
        github_user.email = github_user_email.email;
      }
      if (!github_user.email) {
        github_user.email = `${github_user.login}@users.noreply.github.com`;
      }

      if (!github_user.login || !github_user.email) {
        return reply.status(401).send({ success: false, message: 'Error fetching user credentials from GitHub.' });
      }

      // Add github_user.id into user table in new column
      // Check if user with this pauth_id exists in auth_users table
      let authUser = getAuthUser({ oauthId: github_user.id });

      // Now process the user creds in our backend - compare to sign-up process
      if (!authUser) {
        const tempAuthUser: Partial<AuthUser> = { user_name: github_user.login, email: github_user.email, oauth_id: github_user.id };
        const { authUser: newAuthUser } = await createAuthUser({ ...tempAuthUser, passwd: 'oauth' });
        authUser = newAuthUser;
      }

      //_______________________________________________________________

      try {
        const session = createSession(authUser, secret);
        const refreshTokenCookie = generateTokenCookie(session.refreshToken, 'refresh_token');
        const authUserClient: AuthUserClient = {
          user_name: authUser.user_name,
          email: authUser.email,
        }

        return reply.header('set-cookie', refreshTokenCookie).code(200).send({
          success: true,
          //user: user,
          auth: authUserClient,
          access_token: session.accessToken.raw, // is this correct?
        } as any);
      } catch (e: any) {
        request.log.error(e);
        return reply.code(e.code || 500).send({ success: false, message: e.message || e });
      }

    } catch (e) {
      request.log.error(e);
      return reply.code(500).send({ success: false, message: `OAuth Login Error` });
    }
  });

  fastify.post<AuthSignUpRequest>('/sign-up', async (request, reply) => {
    try {
      const { passwd, user_name, email } = request.body;

      const authUser = getAuthUser({ user_name, email });
      if (authUser)
        return reply
          .code(409)
          .send({
            success: false,
            message: "Username or Email already taken"
        });

      const tempAuthUser: Partial<AuthUser> = { user_name: user_name, email };
      const { user, authUser: newAuthUser } = await createAuthUser({ ...tempAuthUser, passwd });

      try {
        const session = createSession(newAuthUser, secret);
        const authUserClient: AuthUserClient = {
          email: newAuthUser.email,
          user_name: newAuthUser.user_name,
        }

        return reply
          .code(200)
          .setCookie('access_token', session.accessToken.raw, {
            httpOnly: true,
            path: '/',
            sameSite: 'strict',
            secure: 'auto'
          })
          .setCookie('refresh_token', session.refreshToken, {
            httpOnly: true,
            path: '/',
            sameSite: 'strict',
            secure: 'auto'
          })
          .send({
            success: true,
            user: user,
            auth: authUserClient,
            access_token: session.accessToken.raw,
          } as any);
      } catch (e: any) {
        request.log.error(e);
        return reply
          .code(e.code || 500)
          .send({
            success: false,
            message: e.message || `Internal Server Error`
          });
      }
    } catch (e: any) {
      request.log.error(e);
      return reply.code(401).send({ success: false, message: e.message || e })
    }
  });

  fastify.patch<AuthUpdateRequest>('/update', async (request, reply) => {
    const { email, user_name, passwd } = request.body;

    try {
      const authUser = getAuthUser({ email, user_name });
      if (!authUser)
        return reply
          .code(401)
          .send({
            success: false,
            message: "No such User"
          });

      const newAuth = {
        id: authUser.id,
        passwd,
        email,
        user_name,
      }

      const newUser = await updateUserCredentials(newAuth);
      if (!newUser)
        throw new ApiError({ message: "Failed to update database", code: 400 });

      reply
        .code(200)
        .send({
          success: true,
          auth: {
            email: newUser.email,
            user_name: newUser.user_name
          }
        });
    } catch (e: any) {
      reply
        .code(e.code || e.status | 400)
        .send({
          success: false,
          message: e.message || e
        })
    }
  })

  fastify.delete<AuthDeleteRequest>('/delete', async (req, repl) => {
    try {
      const token = extractJWTFromHeader(req.cookies.access_token);
      const authUser = getAuthUser({ userId: token.payload.sub });
      if (!authUser) throw new ApiError({ code: 404, message: 'No such User' });

      await deleteUser(token);
      await deleteAuthUser(authUser);

      return repl
        .code(200)
        .clearCookie('refresh_token')
        .clearCookie('access_token')
        .send({ success: true })

    } catch (e: any) {
      req.log.error(e);

      return repl
        .code(e.code || 500)
        .send({
          success: false,
          message: e.message || 'Internal Server Error'
        });
    }
  })
}
