import { request } from "./utils";
import type { User } from "@shared/user";

export const getUser = async () => {
  const req = new Request(`/api/user`, {
    method: "GET",
  });

  const data = await request(req);

  return data;
}

export const getUsers = async () => {
  const req = new Request('/api/user/all', {
    method: 'get',
  })

  const data = await request(req);

  return data;
}

export const updateUser = async (user: Partial<User>, avatar?: File) => {
  const userForm = new FormData();

  if (avatar)
    userForm.append('avatar', avatar)
  userForm.append('user', JSON.stringify(user));

  const req = new Request('/api/user/update', {
    method: 'post',
    body: userForm
  });

  const data = await request(req);

  return data;
}

export const getFriends = async () => {
  const req = new Request('/api/user/friend/', {
    method: 'get',
  })

  const data = await request(req);

  return data;
}

export const acceptFriendRequest = async (reqId: number) => {
  const req = new Request(`/api/user/friend/accept/${reqId}`, {
    method: 'post',
  });

  const data = await request(req);

  return data;
}

export const sendFriendRequest = async (friendId: number) => {
  const req = new Request(`/api/user/friend/request/${friendId}`, {
    method: 'post',
  });

  const data = await request(req);

  return data;
}

export const removeFriendship = async (friendshipId: number) => {
  const req = new Request(`/api/user/friend/remove/${friendshipId}`, {
    method: 'delete',
  });

  const data = await request(req);

  return data;
}
