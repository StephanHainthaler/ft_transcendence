import { Avatar, User } from "@shared/user";
import { db } from "./db";
import { eq, IN } from "@server/orm";
import { sqliteErrorToApiError } from "@server/orm/error"
import { ApiError } from "@server/error/apiError";
import { writeFile, unlink } from "node:fs/promises";
import { join } from "node:path";

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

async function storeAvatar(userId: number, avatar: { buffer: Buffer, mimetype: string } | string): Promise<Avatar> {
  try {
    if (typeof avatar !== 'string') {
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

      const extension = avatar.mimetype.split('/')[1] || 'png';
      const newFileName = `avatar-${userId}-${Date.now()}.${extension}`;
      const filePath = join(AVATAR_DIR, newFileName);
      const newLocation = join('/api/user/avatar', newFileName);

      await writeFile(filePath, avatar.buffer);

      const newAvatar = db
        .from('avatars')
        .insert({ user_id: userId, location: newLocation })
        .select('*')
        .single();
      if (!newAvatar) throw new ApiError({ code: 500, message: 'Failed to store avatar' });

      return newAvatar;
    } else {
      const newLocation: string = avatar;
      const newAvatar = db.from('avatars')
        .insert({ user_id: userId, location: newLocation })
        .select('*')
        .single();
      if (!newAvatar) throw new ApiError({ code: 500, message: 'Failed to store avatar' });
      return newAvatar;
    }
  } catch (e: any) {
    throw sqliteErrorToApiError(e);
  }
}

export async function createUser(user: User, oauthAvatarUrl?: string): Promise<{ user: User, avatar: Avatar | null }> {
  try {
    const newUser = db
      .from('users')
      .insert(user)
      .select('*')
      .single();
    if (!newUser) throw new ApiError({ code: 500, message: 'Failed to create user' });

    let newAvatar: Avatar | null = null;
    if (oauthAvatarUrl) {
      newAvatar = await storeAvatar(newUser.id, oauthAvatarUrl)
    }

    return { user: newUser, avatar: newAvatar };
  } catch (e: any) {
    throw sqliteErrorToApiError(e)
  }
}

export async function deleteUser(userId: number) {
  try {
    const avatars = db
      .from('avatars')
      .where(eq('user_id', userId))
      .select('*')
      .all();

    console.log(`deleteing avatars: ${JSON.stringify(avatars)}`);

    await Promise.all(avatars.map(async (a) => {
      try {
        if (!a.location.startsWith('https://')) {
          const filepathSplit = a.location.split('/');
          if (filepathSplit.length > 0) {
            const filename = filepathSplit[filepathSplit.length - 1];
            const filelocation = `${AVATAR_DIR}/${filename}`;
            await unlink(filelocation);
          }
        }
      } catch (e: any) {
        console.error(e);
      }
    }));

    db
      .from('avatars')
      .where(eq('user_id', userId))
      .delete()
      .run();
    db
      .from('users')
      .where(eq('id', userId))
      .delete()
      .run();
  } catch (e: any) {
    throw sqliteErrorToApiError(e);
  }
}

export async function updateUser(id: number, user: Partial<User>, avatar: { buffer: Buffer, mimetype: string } | null | undefined): Promise<{ user: User, avatar: Avatar | null }> {
  try {
    const updatedUser = db
      .from('users')
      .update(user)
      .where(eq('id', id))
      .select('*')
      .single();
    if (!updatedUser) throw new ApiError({ code: 404, message: 'User not found' });

    let updatedAvatar = null;
    if (avatar) {
      updatedAvatar = await storeAvatar(id, avatar);
    } else {
      updatedAvatar = db
        .from('avatars')
        .select('*')
        .where(eq('user_id', id))
        .single();
    }

    return { user: updatedUser, avatar: updatedAvatar };
  } catch (e: any) {
    throw sqliteErrorToApiError(e);
  }
}
