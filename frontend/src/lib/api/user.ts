import { request } from "./utils";
import type { Writable } from "@lib/types/writable";
import type { JWT } from "@shared/api";
import type { User } from "@shared/user";

export const getUser = async (token: Writable<JWT | null>) => {
  const req = new Request(`/api/user`, {
    method: "GET",
    headers: {
      'authorization': `Bearer ${ token.get()?.raw }`
    },
  })

  const response = await request(req, token);
  const data = await response.json();
  if (!response.ok) {
    throw data;
  }

  return data;
}

export const getUsers = async (token: Writable<JWT | null>) => {
  const req = new Request('/api/user/all', {
    method: 'get',
    headers: {
      'authorization': `Bearer ${ token.get()?.raw }`
    }
  })

  const response = await request(req, token);
  const data = await response.json();
  if (!response.ok) throw data;

  return data;
}

export const updateUser = async (token: Writable<JWT | null>, user: Partial<User>, avatar?: File) => {
  const userForm = new FormData();

  if (avatar)
    userForm.append('avatar', avatar)
  userForm.append('user', JSON.stringify(user));

  const req = new Request('/api/user/update', {
    method: 'post',
    headers: {
      'Authorization': `Bearer ${token.get()?.raw}`
    },
    body: userForm
  });

  const response = await request(req, token);
  const data = await response.json();
  if (!response.ok) throw data;

  return data;
}

export const getFriends = async (token: Writable<JWT | null>) => {
  const req = new Request('/api/user/friend/', {
    method: 'get',
    headers: {
      'authorization': `Bearer ${ token.get()?.raw }`
    }
  })

  const response = await request(req, token);
  const data = await response.json()
  if (!response.ok) {
    throw data;
  }
  return data;
}

export const acceptFriendRequest = async (token: Writable<JWT | null>, reqId: number) => {
  const req = new Request(`/api/user/friend/accept/${reqId}`, {
    method: 'post',
    headers: {
      'authorization': `Bearer ${ token.get()?.raw }`
    }
  });

  const response = await request(req, token);
  const data = await response.json();
  if (!response.ok) {
    throw data;
  }
  return data;
}

export const sendFriendRequest = async (token: Writable<JWT | null>, friendId: number) => {
  const req = new Request(`/api/user/friend/request/${friendId}`, {
    method: 'post',
    headers: {
      'authorization': `Bearer ${ token.get()?.raw }`
    }
  });

  const response = await request(req, token);
  const data = await response.json();
  if (!response.ok) {
    throw data;
  }
  return data;
}

export const removeFriendship = async (token: Writable<JWT | null>, friendshipId: number) => {
  const req = new Request(`/api/user/friend/remove/${friendshipId}`, {
    method: 'delete',
    headers: {
      'authorization': `Bearer ${ token.get()?.raw }`
    }
  });

  const response = await request(req, token);

  const data = await response.json();
  if (!response.ok) {
    throw data;
  };
  return data;
}
