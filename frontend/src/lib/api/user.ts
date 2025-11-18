import type { Writable } from "@lib/types/writable";
import { request } from "./utils";
import type { JWT } from "@shared/api";
import { client } from "./client";

export async function getUser() {
  const req = new Request(`/api/user`, {
    method: "GET",
    headers: {
      'Authorization': client.authHeader
    },
  })

  const response = await request(req);
  const data = await response.json();
  if (!response.ok) {
    throw data;
  }
  return data;
}

export const getUsers = async () => {
  const req = new Request('/api/user/all', {
    method: 'get',
    headers: {
      'Authorization': client.authHeader,
    }
  })

  const response = await request(req);
  const data = await response.json();
  if (!response.ok) throw data;

  return data;
}

export const getFriends = async () => {
  const req = new Request('/api/user/friend/', {
    method: 'get',
    headers: {
      'authorization': client.authHeader
    }
  })

  const response = await request(req);
  const data = await response.json()
  if (!response.ok) {
    throw data;
  }
  return data;
}

export const acceptFriendRequest = async (reqId: number) => {
  const req = new Request(`/api/user/friend/accept/${reqId}`, {
    method: 'post',
    headers: {
      'authorization': client.authHeader,
    }
  });

  const response = await request(req);
  const data = await response.json();
  if (!response.ok) {
    throw data;
  }
  return data;
}

export const sendFriendRequest = async (friendId: number) => {
  const req = new Request(`/api/user/friend/request/${friendId}`, {
    method: 'post',
    headers: {
      'authorization': client.authHeader
    }
  });

  const response = await request(req);
  const data = await response.json();
  if (!response.ok) {
    throw data;
  }
  return data;
}

export const removeFriendship = async (friendshipID: number) => {
  const req = new Request(`/api/user/friend/remove/${friendshipID}`, {
    method: 'delete',
    headers: {
      'authorization': client.authHeader,
    }
  });

  const response = await request(req);

  const data = await response.json();
  if (!response.ok) {
    throw data;
  };
  return data;
}