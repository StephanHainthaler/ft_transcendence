import { request } from "./utils";
import type { User } from "@shared/user";

export const getUser = async () => {
  const req = new Request(`${import.meta.env.VITE_API_URL}/user`, {
    method: "GET",
  });

  const data = await request(req);

  return data;
}

export const getUsers = async () => {
  const req = new Request(`${import.meta.env.VITE_API_URL}/user/all`, {
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

  const req = new Request(`${import.meta.env.VITE_API_URL}/user/update`, {
    method: 'post',
    body: userForm
  });

  const data = await request(req);

  return data;
}

export const getFriends = async () => {
  const req = new Request(`${import.meta.env.VITE_API_URL}/user/friend/`, {
    method: 'get',
  })

  const data = await request(req);

  return data;
}

export const acceptFriendRequest = async (reqId: number) => {
  const req = new Request(`${import.meta.env.VITE_API_URL}/user/friend/accept/${reqId}`, {
    method: 'post',
  });

  const data = await request(req);

  return data;
}

export const sendFriendRequest = async (friendId: number) => {
  const req = new Request(`${import.meta.env.VITE_API_URL}/user/friend/request/${friendId}`, {
    method: 'post',
  });

  const data = await request(req);

  return data;
}

export const removeFriendship = async (friendshipId: number) => {
  const req = new Request(`${import.meta.env.VITE_API_URL}/user/friend/remove/${friendshipId}`, {
    method: 'delete',
  });

  const data = await request(req);

  return data;
}
