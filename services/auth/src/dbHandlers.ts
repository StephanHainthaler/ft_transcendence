import { db } from "./db";
import { AuthUser } from "./db";
import { User } from "@shared/user"
import { createUser } from "@ft_transcendence/user/src/api"
import argon2 from "argon2";

async function hashPassword(passwd: string): Promise<string> {
  const hash = await argon2.hash(passwd)
  return hash;
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
    const user = db.from('auth_users').select('*').eq('user_name', username).single();
    if (user) return user;
  }
  if (authId) {
    const user = db.from('auth_users').select('*').eq('id', authId).single();
    if (user) return user;
  }
  if (userId) {
    const user = db.from('auth_users').select('*').eq('user_id', userId).single();
    if (user) return user;
  }
  if (email) {
    const user = db.from('auth_users').select('*').eq('email', email).single();
    if (user) return user;
  }

  if (!userId && !username && !authId) {
    throw new Error("Missing fields: need either username, authid or userid");
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

  if (!user) throw new Error("Invalid credentials");
  console.log("user: ", user);
  if (await argon2.verify(user.passwd, passwd)) throw new Error("Invalid user password");

  return user;
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
