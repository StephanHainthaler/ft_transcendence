import type { User } from "@shared/user/interfaces";

export class UserClient {
  async getUser(): Promise<User> {
    const response = await fetch("/api/user/get", {
      method: "GET",
    })

    if (!response.ok) throw new Error(`${response.status}`);
    const user = await response.json();
    return user;
  }
}

export const userClient = new UserClient();
