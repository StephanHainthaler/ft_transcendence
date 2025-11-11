import { User } from "@shared/user";
import { db } from "./db";

const USER_API = process.env.USER_API_URL!;

export async function createUser(user: User | Partial<User>): Promise<User> {
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

export async function getUser(id: number): Promise<User> {
  const response = await fetch(`${USER_API}/${id}`, {
    method: 'get',
  });

  return await response.json();
}

export function getAllUsers() {
  const users = db.from('users').select('*').all();
  return users;
}
