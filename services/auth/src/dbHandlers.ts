import { db } from "./db";
import { AuthUser, Session } from "./db";
import { AuthUserClient, User } from "@shared/user"
import { createUser } from "@ft_transcendence/user/src/api"
import argon2 from "argon2";
import { generateJWT } from "./jwt";
import crypto from "crypto";
import { JWT } from "@shared/api";
import { eq } from "@server/orm";
import { sqliteErrorToApiError } from "@server/orm/error";
import { ApiError } from "@server/error/apiError";

async function hashPassword(passwd: string): Promise<string> {
  const hash = await argon2.hash(passwd)
  return hash;
}

export function generateRefreshToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

export function hashRefreshToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

export function getAuthUser({
  user_name, authId, userId, email, oauthId
}:{
  user_name?: string,
  authId?: number,
  userId?: number,
  email?: string,
  oauthId?: number,
}): AuthUser | null {
  try {
    if (user_name) {
      const user = db.from('auth_users').select('*').where(eq('user_name', user_name)).single();
      if (user) return user;
    }
    if (authId) {
      const user = db.from('auth_users').select('*').where(eq('id', authId)).single();
      if (user) return user;
    }
    if (userId) {
      const user = db.from('auth_users').select('*').where(eq('user_id', userId)).single();
      if (user) return user;
    }
    if (email) {
      const user = db.from('auth_users').select('*').where(eq('email', email)).single();
      if (user) return user;
    }
    if (oauthId) {
      const user = db.from('auth_users').select('*').where(eq('oauth_id', oauthId)).single();
      if (user) return user;
    }
  } catch (e: any) {
    throw sqliteErrorToApiError(e);
  }

  if (!userId && !user_name && !authId && !oauthId) {
    throw new Error("Missing fields: need either user_name, authid or userid");
  }

  return null;
}

export async function deleteAuthUser(authUser: AuthUser){
  try {
    deleteSession({ authId: authUser.id });
    db.from('auth_users')
      .where(eq('id', authUser.id))
      .delete()
      .run();
  } catch (e: any) {
    throw sqliteErrorToApiError(e);
  }
}

export function getAuthUserClient({
  user_name, authId, userId, email,
}:{
  user_name?: string,
  authId?: number,
  userId?: number,
  email?: string,
}): AuthUserClient | null {
  const authUser = getAuthUser({ user_name, authId, userId, email });
  if (authUser) {
    return {
      email: authUser.email,
      user_name: authUser.user_name,
    }
  }
  return null;
}

export async function verifyUserCredentials({
  email, user_name, passwd,
}: {
  email?: string, user_name?: string, passwd?: string
}): Promise<AuthUser> {
  if (!email && !user_name) throw new Error("Missing email or user_name");
  if (!passwd) throw new Error("Missing password");

  const user = getAuthUser({ user_name, email });

  if (!user) throw new Error("Invalid credentials");
  if (!await argon2.verify(user.passwd, passwd)) throw new Error("Invalid user password");

  return user;
}

export async function updateUserCredentials(newAuthUser: Partial<AuthUser>) {
  try {
    const { passwd } = newAuthUser;
    if (passwd) {
      const newPasswordHash = await hashPassword(passwd);
      newAuthUser.passwd = newPasswordHash;
    }
    return db.from('auth_users')
      .update(newAuthUser)
      .where(eq('id', newAuthUser.id))
      .select('*')
      .single()
  } catch (e: any) {
    throw sqliteErrorToApiError(e);
  }
}

export async function createAuthUser(authUser: Partial<AuthUser>): Promise<{ user: User, authUser: AuthUser }> {
  const user = { name: authUser.user_name };
  const { user: newUser } = await createUser(user);
  authUser.user_id = newUser.id;

  if (!authUser.passwd) throw new ApiError({ code: 404, message: "Password missing" });
  authUser.passwd = await hashPassword(authUser.passwd);

  let newAuthUser;
  try {
    newAuthUser = db
      .from('auth_users')
      .insert(authUser)
      .select('*')
      .single();
  } catch (e) {
    throw sqliteErrorToApiError(e);
  }

  if (!newAuthUser) throw new ApiError({ code: 500, message: 'Internal Server Error' });
  return { user: newUser, authUser: newAuthUser };
}

export const refreshTokenLifetime = 1000 * 60 * 60 * 24 * 10;

export function createSession(user: AuthUser, secret: string): { accessToken: JWT, refreshToken: string } {
  const accessToken = generateJWT({ id: user.id }, secret)
  const refreshToken = generateRefreshToken();

  const tokenHash = hashRefreshToken(refreshToken);

  const session: Session = {
    auth_id: user.id,
    user_id: user.user_id,
    token: tokenHash,
    created_at: Date.now(),
    expires_in: refreshTokenLifetime,
  };

  let currentSession;
  try {
    currentSession = db
      .from('sessions')
      .select('*')
      .where(eq('auth_id', user.id))
      .single();
  } catch (e: any) {
    throw sqliteErrorToApiError(e);
  }
  try {
    if (currentSession) {
      db
        .from('sessions')
        .update(session)
        .where(eq('auth_id', user.id))
        .run();
    } else {
      db
        .from('sessions')
        .insert(session)
        .run();
    }
  } catch (e) {
    throw sqliteErrorToApiError(e);
  }

  return { accessToken, refreshToken };
}

export function getSession({
  authId, userId,  token,
}: {
  authId?: number, userId?: number, token?: string
}): Session | null{
  if (userId) {
    try {
      const session = db
        .from('sessions')
        .select('*')
        .where(eq('user_id', userId))
        .single();

      if (!session)
        throw new ApiError({ code: 404, message: 'No session for that user' });

      return session;
    } catch (e: any) {
      throw sqliteErrorToApiError(e);
    }
  } else if (authId) {
    try {
      const session = db
        .from('sessions')
        .select('*')
        .where(eq('auth_id', authId))
        .single();

      if (!session)
        throw new ApiError({ code: 404, message: 'No session for that user' });

      return session;
    } catch (e: any) {
      throw sqliteErrorToApiError(e);
    }
  } else if (token) {
    try {
      const tokenHash = hashRefreshToken(token);
      const session = db
        .from('sessions')
        .select('*')
        .where(eq('token', tokenHash))
        .single();

      return session;
    } catch (e: any) {
      throw sqliteErrorToApiError(e);
    }
  } else {
    throw new ApiError({ code: 401, message: 'Invalid session query data'});
  }
}

export function deleteSession({
  authId, userId, token,
}: {
  authId?: number, userId?: number, token?: string
}) {
  try {
    if (userId) {
      const session = db.from('sessions').delete().where(eq('user_id', userId)).run();
      if (!session)
        throw new ApiError({ code: 404, message: 'No session for that user' });

      return session;
    } else if (authId) {
      const session = db.from('sessions').delete().where(eq('auth_id', authId)).run();
      if (!session)
        throw new ApiError({ code: 404, message: 'No session for that user' });

      return session;
    } else if (token) {
      const tokenHash = hashRefreshToken(token);
      const session = db.from('sessions').delete().where(eq('token', tokenHash)).run();
      if (!session)
        throw new ApiError({ code: 404, message: 'No session for that user' });

      return session;
    } else {
      throw new ApiError({ code: 401, message: 'Invalid session query data'});
    }
  } catch (e: any) {
    throw sqliteErrorToApiError(e);
  }
}
