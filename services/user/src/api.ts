import { User } from "@shared/user";

const USER_API = process.env.USER_API_URL!;

export async function createUser(user: User | Partial<User>): Promise<{ user: User}> {
  const response = await fetch(`${USER_API}/new`, {
    method: 'post',
    headers: {
      "content-type": 'application/json',
    },
    body: JSON.stringify({ user })
  });

  const newUser = await response.json();
  return newUser;
}

export async function updateUser(user: User | Partial<User>): Promise<User> {
  const response = await fetch(`${USER_API}/update`, {
    method: 'patch',
    headers: {
      "content-type": 'application/json',
    },
    body: JSON.stringify({ user })
  });

  const newUser = await response.json();
  return newUser;
}

export async function getUser(id: number): Promise<User> {
  const response = await fetch(`${USER_API}/${id}`, {
    method: 'get',
  });
  const data = await response.json();
  return data.user;
}

export async function getAllUsers() {
  const response = await fetch(`${USER_API}/all`, {
    method: 'get',
  })
  const data = await response.json();
  return data.users;
}
