import { Avatar, User } from "@shared/user";
import { db } from "./db";
import { eq, IN } from "@server/orm";
import { sqliteErrorToApiError } from "@server/orm/error"
import { writeFile, unlink } from "node:fs/promises";
import { join } from "node:path";
import { MultipartFile } from "@fastify/multipart";

const AVATAR_DIR = process.env.AVATAR_DIR!;
if (!AVATAR_DIR) throw new Error('AVATAR_DIR env is missing');

export function getUser(id: number): { user: User | null, avatar: Avatar | null } {
  try {
    const user = db
      .from('users')
      .select('*')
      .where(eq('id', id))
      .single();
    const avatar = db
      .from('avatars')
      .select('*')
      .where(eq('user_id', id))
      .single();
    return { user, avatar };
  } catch (e: any) {
    throw sqliteErrorToApiError(e)
  }
}

export function getUsers(ids: number[]): { user: User, avatar: Avatar | null }[] {
  try {
    const users = db
      .from('users')
      .select('*')
      .where(IN('id', ids))
      .all();
    const avatars = db
      .from('avatars')
      .select('*')
      .where(IN('user_id', ids))
      .all();
    const ret = users.map(u => {
      const avatar = avatars.find(a => a.user_id === u.id) ?? null;
      return { user: u, avatar };
    })
    return ret;
  } catch (e: any) {
    throw sqliteErrorToApiError(e);
  }
}

export function getAllUsers(): { user: User, avatar: Avatar | null }[] {
  try {
    const users = db
      .from('users')
      .select('*')
      .all();
    const avatars = db
      .from('avatars')
      .select('*')
      .all();
    const ret = users.map(u => {
      const avatar = avatars.find(a => a.user_id === u.id) ?? null;
      return { user: u, avatar };
    })
    return ret;
  } catch (e: any) {
    throw sqliteErrorToApiError(e)
  }
}

async function storeAvatar(userId: number, avatar: MultipartFile): Promise<Avatar> {
  try {
    const currentAvatar = db
      .from('avatars')
      .select('*')
      .where(eq('user_id', userId))
      .single();

    if (currentAvatar) {
      try {
        const currentAvatarLocation = `${AVATAR_DIR}/${currentAvatar.location}`;
        await unlink(currentAvatarLocation);
      } catch (e) {
        console.error(e);
      }
      db.from('avatars').delete().where(eq('id', currentAvatar.id)).run();
    }

    const extensionIdx = avatar.filename.lastIndexOf('.');
    const filename = avatar.filename.slice(0, extensionIdx);
    const extension = avatar.filename.slice(extensionIdx);
    const newFileName = `${filename}-${Date.now()}${extension}`;
    const filePath = join(AVATAR_DIR, newFileName);

    const buffer = Buffer.from(await avatar.toBuffer());
    await writeFile(filePath, buffer);

    const newAvatar = db
      .from('avatars')
      .insert({ user_id: userId, location: newFileName })
      .select('*')
      .single()!;

    return newAvatar;
  } catch (e: any) {
    throw sqliteErrorToApiError(e);
  }
}

export function createUser(user: User): { user: User, avatar: Avatar | null } {
  try {
    const newUser = db
      .from('users')
      .insert(user)
      .select('*')
      .single()!;

    let newAvatar = null;

    return { user: newUser, avatar: newAvatar };
  } catch (e: any) {
    throw sqliteErrorToApiError(e)
  }
}

export async function updateUser(id: number, user: Partial<User>, avatar: MultipartFile | null | undefined): Promise<{ user: User, avatar: Avatar | null }> {
  try {
    const updatedUser = db
      .from('users')
      .update(user)
      .where(eq('id', user.id))
      .select('*')
      .single()!;

    let updatedAvatar = null;
    if (avatar) {
      updatedAvatar = await storeAvatar(id, avatar);
    } else {
      updatedAvatar = db
        .from('avatars')
        .select('*')
        .where(eq('user_id', user.id))
        .single();
    }

    return { user: updatedUser, avatar: updatedAvatar };
  } catch (e: any) {
    throw sqliteErrorToApiError(e);
  }
}
