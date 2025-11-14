import type { User } from "@shared/user";

type SignupRequestBody = {
  username: string,
  email: string,
  passwd: string
};

type LoginRequestBody = {
  username?: string,
  email?: string,
  passwd: string
};

class AuthClient {
  constructor() {}

  async signup(info: SignupRequestBody): Promise<User> {
    if ((!info.username && !info.email))
      throw new Error("Missing Email of Username!");
    if (!info.passwd) throw new Error("Missing Password!");

    const response = await fetch('/api/auth/sign-up', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(info),
    });

    const data = await response.json();
    if (!response.ok) throw data;
    console.info(`Received Sign-Up Response: ${JSON.stringify(data)}`)
    return data as User;
  }

  async login(info: LoginRequestBody): Promise<User> {
    if ((!info.username && !info.email))
      throw new Error("Missing Email of Username!");
    if (!info.passwd) throw new Error("Missing Password!");

    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(info),
    });

    const data = await response.json();
    if (!response.ok) throw data;
    return data as User;
  }
}

export const authClient = new AuthClient();
