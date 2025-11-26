import { db } from "./db";
import { AuthUser, Session } from "./db";
import { AuthUserClient, User } from "@shared/user"
import { createUser } from "@ft_transcendence/user/src/api"
import argon2 from "argon2";
import { generateJWT } from "./jwt";
import crypto from "crypto";
import { JWT } from "@shared/api";
import { eq } from "@server/orm";

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
  username, authId, userId, email,
}:{
  username?: string,
  authId?: number,
  userId?: number,
  email?: string,
}): AuthUser | null {
  if (username) {
    const user = db.from('auth_users').select('*').where(eq('user_name', username)).single();
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

  if (!userId && !username && !authId) {
    throw new Error("Missing fields: need either username, authid or userid");
  }

  return null;
}

export function getAuthUserClient({
  username, authId, userId, email,
}:{
  username?: string,
  authId?: number,
  userId?: number,
  email?: string,
}): AuthUserClient | null {
  const authUser = getAuthUser({ username, authId, userId, email });
  if (authUser) {
    return {
      email: authUser.email,
      username: authUser.user_name,
    }
  }
  return null;
}
export async function verifyUserCredentials({
  email, username, passwd,
}: {
  email?: string, username?: string, passwd?: string
}): Promise<AuthUser> {
  if (!email && !username) throw new Error("Missing email or username");
  if (!passwd) throw new Error("Missing password");

  const user = getAuthUser({ username, email });
  console.log('PASSWD IN VERIFY', passwd);

  if (!user) throw new Error("Invalid credentials");
  console.log("user: ", user);
  if (!await argon2.verify(user.passwd, passwd)) throw new Error("Invalid user password");

  return user;
}

export function updateUserCredentials(newAuthUser: Partial<AuthUser>) {
  return db.from('auth_users')
    .update(newAuthUser)
    .where(eq('id', newAuthUser.id))
    .single()
}

export async function createAuthUser(authUser: Partial<AuthUser>): Promise<{ user: User, authUser: AuthUser }> {
  const user = { name: authUser.user_name };
  const newUser = await createUser(user);
  authUser.user_id = newUser.id;

  if (!authUser.passwd) throw new Error("Auth user is missing password");
  authUser.passwd = await hashPassword(authUser.passwd);

  const newAuthUser = db.from('auth_users').insert(authUser).select('*').single();
  if (!newAuthUser) throw new Error(`Auth user creation Failed with: ${JSON.stringify(authUser)}`)
  return { user: newUser, authUser: newAuthUser };
}

export const refreshTokenLifetime = 1000 * 60 * 60 * 24 * 10;

export function createSession(user: AuthUser, secret: string): { accessToken: JWT, refreshToken: string } {
  const accessToken = generateJWT(user, secret)
  const refreshToken = generateRefreshToken();

  const tokenHash = hashRefreshToken(refreshToken);

  const session: Session = {
    auth_id: user.id,
    user_id: user.user_id,
    token: tokenHash,
    created_at: Date.now(),
    expires_in: refreshTokenLifetime,
  };

  const currentSession = db
    .from('sessions')
    .select('*')
    .where(eq('auth_id', user.id))
    .single();
  console.log("CURRENT_SESSION", currentSession);

  if (currentSession) {
    console.log('updating current sesstion', session);
    console.log('for token: ', refreshToken);
    db.from('sessions').update(session).where(eq('auth_id', user.id)).run();
  } else {
    const query = db.from('sessions').insert(session);
    console.log(`QUERY: ${query.stringify().sql}`)
    const result = query.run();
    if (result.changes <= 0) {
      throw new Error('Database: token storage failed');
    }
  }

  return { accessToken, refreshToken };
}

export function getSession({
  authId, userId,  token,
}: {
  authId?: number, userId?: number, token?: string
}): Session {
  if (userId) {
    const session = db.from('sessions').select('*').where(eq('user_id', userId)).single();
    if (!session)
      throw new Error('No session for that user');

    return session;
  } else if (authId) {
    const session = db.from('sessions').select('*').where(eq('auth_id', authId)).single();
    if (!session)
      throw new Error('No session for that user');

    return session;
  } else if (token) {
    console.log('send token: ', token);
    const tokenHash = hashRefreshToken(token);
    console.log('tokenhash:', tokenHash);
    const sessionQuery = db.from('sessions').select('*').where(eq('token', tokenHash));
    console.log(sessionQuery.stringify());
    const session = sessionQuery.single();
    const allSession = db.from('sessions').select('*').all();
    console.log('currentSessions: ', allSession);
    if (!session)
      throw new Error('No session for that user');

    return session;
  } else {
    throw new Error('Invalid session query data');
  }
}

export function deleteSession({
  authId, userId,  token,
}: {
  authId?: number, userId?: number, token?: string
}) {
  if (userId) {
    const session = db.from('sessions').delete().where(eq('user_id', userId)).single();
    if (!session)
      throw new Error('No session for that user');

    return session;
  } else if (authId) {
    const session = db.from('sessions').delete().where(eq('auth_id', authId)).single();
    if (!session)
      throw new Error('No session for that user');

    return session;
  } else if (token) {
    const tokenHash = hashRefreshToken(token);
    const session = db.from('sessions').delete().where(eq('token', tokenHash)).single();
    if (!session)
      throw new Error('No session for that user');

    return session;
  } else {
    throw new Error('Invalid session query data');
  }
}
