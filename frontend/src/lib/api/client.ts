import { Writable } from "@lib/types/writable";
import type { AuthUserClient, User } from "@shared/user";
import { getAuth, loginRequest, signupRequest, updateRequest } from "./auth";
import { type LoginRequestBody, type SignupRequestBody } from "@shared/api/authRequest";
import type { JWT } from "@shared/api";
import { parseJWT } from "@shared/api";
import { getUser } from "./user";

export type ApiError = {
  code: number,
  message: string,
};

export type Session = {
  user: User,
  auth: AuthUserClient,
}

class ApiClient {
  private readonly userStore: Writable<User | null> = new Writable('user');
  private readonly authStore: Writable<AuthUserClient | null> = new Writable('auth');
  private readonly accessToken: Writable<JWT | null> = new Writable('token');
  private listeners: Set<Function> = new Set();

  constructor() {}

  async init() {
    try {
      console.log('running init');
      const [user, auth] = await Promise.all([
        this.getUser(),
        this.getAuth(),
      ])
      this.userStore.set(user);
      this.authStore.set(auth);
      this.notify();
    } catch {

    }
  }

  get user(): User | null {
    return this.userStore.get() ?? null;
  }

  get auth(): AuthUserClient | null {
    return this.authStore.get() ?? null;
  }

  set user(val: User | null) {
    this.userStore.set(val);
  }

  set auth(val: AuthUserClient | null) {
    this.authStore.set(val);
  }

  get session(): Session | null {
    if (!this.isLoggedIn) return null;
    return { auth: this.auth!, user: this.user! };
  }

  async getSession(): Promise<Session> {
    let user = this.userStore.get();
    let auth = this.authStore.get();
    if (!user) {
      user = await this.getUser();
      this.userStore.set(user);
    }
    if (!auth) {
      auth = await this.getAuth();
      this.authStore.set(auth);
    }
    return { auth, user }
  }

  get isLoggedIn(): boolean {
    return !!(this.user && this.auth);
  }

  onChange(fn: Function) {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  private notify() {
    this.listeners.forEach(fn => fn());
  }

  updateUser(updateFunc: (e: Event, user: User) => void) {
    return (e: Event) => {
      const user = this.user;
      if (!user) return;
      updateFunc(e, user);
    }
  }

  async updateUserInfo(newUser: Partial<User>): Promise<User> {
    if (!newUser) throw new Error('No User Set');
    const response = await fetch(`/api/user/update/${newUser.id}`, {
      method: "patch",
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newUser),
    });

    const data = await response.json();

    if (!response.ok) {
      throw data;
    }
    this.userStore.set(data.user);
    return data.user;
  }

  async signup(info: SignupRequestBody) {
    try {
      const response = await signupRequest(info, this.accessToken);
      this.authStore.set(response.auth);
    } catch (e: any) {
      const error = new Error(`Signup Failed: ${e.message || e}`)
      console.error(error);
      throw error;
    }
  }

  async getAuth(): Promise<User> {
    return await getAuth(this.accessToken);
  }

  async getUser(): Promise<User> {
    return await getUser(this.accessToken);
  }

  async login(info: LoginRequestBody) {
    try {
      const authResponse = await loginRequest(info);
      this.authStore.set(authResponse.auth)
      if (authResponse.access_token) {
        const jwt = parseJWT(authResponse.access_token);
        this.accessToken.set(jwt);
        const user = await getUser(this.accessToken)
        this.userStore.set(user);
      }
    } catch (e: any) {
      const error = new Error(`Login Failed: ${e.message || e}`)
      console.error(error);
      throw error;
    }
  }

  logout() {
    this.clearSession();
    this.notify();
  }

  clearListeners() {
    this.listeners.clear();
  }

  private clearSession() {
    this.userStore.set(null);
    this.authStore.set(null);
    this.accessToken.set(null);
  }

  async updateCredentials({
    email, username, passwd
  }: {
    email?: string, username?: string, passwd?: string
  }) {
    if (!email && !username && !passwd) {
      throw new Error("No Credentials to update!");
    }
    try {
      const authResponse = await updateRequest(this.accessToken, {
        email, username, passwd
      });
      this.authStore.set(authResponse.auth)
    } catch (e: any) {
      const error = new Error(`Update Failed: ${e.message || e}`)
      console.error(error);
      throw error;
    }
  }
}

export const client = new ApiClient()
