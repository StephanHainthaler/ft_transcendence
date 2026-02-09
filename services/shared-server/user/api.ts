import { ApiError } from "../error/apiError";
import { JWT } from "../../../shared/api";
import { User } from "../../../shared/user";

export const HTTP = process.env.HTTP_PROTOCOL;
if (!HTTP) {
  console.error("Missing Protocol env Vairable! Exiting...");
  process.exit(1);
}

const userUrl = process.env.USER_SERVICE_URL;
if (!userUrl) {
  console.error("Missing USER_SERVICE_URL env Vairable! Exiting...");
  process.exit(1);
}
export const USER_API = `${HTTP}://${userUrl}`;



export async function deleteUser(token: JWT) {
  const response = await fetch(`${USER_API}/delete`, {
    method: 'delete',
    headers: {
      'Authorization': `Bearer ${token.raw}`,
    }
  });

  const data = await response.json();

  if (!response.ok) {
    throw new ApiError({ code: response.status, message: data.message || 'Internal Server Error '})
  }
}

export async function createUser(user: User | Partial<User>, opts?: {
  oauthAvatarUrl: string
}): Promise<{ user: User }> {
  const response = await fetch(`${USER_API}/new`, {
    method: 'post',
    headers: {
      "content-type": 'application/json',
    },
    body: JSON.stringify({ user, oauthAvatarUrl: opts?.oauthAvatarUrl })
  });

  const result = await response.json();

  if (!response.ok) {
    throw new ApiError({ code: response.status, message: result.message || 'Failed to create User' });
  }

  return result;
}

export async function updateUser(user: User | Partial<User>): Promise<User> {
  const form = new FormData();

  form.append('user', JSON.stringify(user));
  const response = await fetch(`${USER_API}/update`, {
    method: 'post',
    body: form
  });

  const result = await response.json();

  if (!response.ok) {
    throw new ApiError({ code: response.status, message: result.message || 'Failed to update User' });
  }

  return result;
}

export async function getUser(id: number): Promise<User> {
  const response = await fetch(`${USER_API}/${id}`, {
    method: 'get',
  });
  const data = await response.json();

  if (!response.ok) {
    throw new ApiError({ code: response.status, message: data.message });
  }

  return data.user;

}

export async function getAllUsers() {
  const response = await fetch(`${USER_API}/all`, {
    method: 'get',
  })
  const data = await response.json();

  if (!response.ok) {
    throw new ApiError({ code: response.status, message: data.message });
  }

  return data.users;
}
