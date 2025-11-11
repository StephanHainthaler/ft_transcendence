import { db } from "./db";
import { AuthUser } from "./db";
import { User } from "@shared/user"
import { createUser, getUser } from "@ft_transcendence/user/src/api"
import { argon2, Hash, randomBytes } from "crypto";

function hashPassword(passwd: string): string {
  const params = {
    message: passwd,
    memory: 12288,
    parallelism: 1,
    passes: 3,
    nonce: randomBytes(16),
    tagLength: 64
  };
  let hash = '';
  argon2('argon2id', params, (err, key) => {
    if (err) throw err;
    hash = key.toString()
  });
  return hash;
}

export function getAuthUser({
  userName, authId, userId, email,
}:{
  userName?: string,
  authId?: number,
  userId?: number,
  email?: string,
}): AuthUser | null {
  if (userName) {
    const user = db.from('auth_users').select('*').eq('user_name', userName).single();
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

  if (!userId && !userName && !authId) {
    throw new Error("Missing fields: need either username, authid or userid");
  }

  return null;
}

export function verifyUserCredentials({
  email, userName, passwd,
}: {
  email?: string, userName?: string, passwd?: string
}): AuthUser {
  if (!email && !userName) throw new Error("Missing email or username field for verification");
  if (!passwd) throw new Error("Missing password hash for verification");

  const user = getAuthUser({ userName, email });

  if (!user) throw new Error("User missing in Database");
  if (user.passwd !== passwd) throw new Error("Invalid user password");

  return user;
}

export async function createAuthUser(authUser: Partial<AuthUser>): Promise<{ user: User, authUser: AuthUser }> {
  const user = { name: authUser.user_name };
  const newUser = await createUser(user);
  authUser.user_id = newUser.id;

  if (!authUser.passwd) throw new Error("Auth user is missing password");
  authUser.passwd = hashPassword(authUser.passwd);

  const newAuthUser = db.from('auth_users').insert(authUser).select('*').single();
  if (!newAuthUser) throw new Error(`Auth user creation Failed with: ${JSON.stringify(authUser)}`)
  return { user: newUser, authUser: newAuthUser };
}
