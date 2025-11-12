import type { User } from "@shared/user/interfaces";

export class UserClient {
  async getUser(): Promise<User> {
    const response = await fetch("/api/user/", {
      method: "GET",
    })

    if (!response.ok) {
      const error = await response.json();
      throw error;
    }
    const user = await response.json();
    return user;
  }
}

export const userClient = new UserClient();
