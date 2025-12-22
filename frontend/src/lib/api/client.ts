import { Writable } from "@lib/types/writable";
import type { AuthUserClient, Avatar, Friendship, User } from "@shared/user";
import { deleteRequest, getAuth, loginRequest, logoutRequest, oauthRequest, signupRequest, updateRequest } from "./auth";
import { type LoginRequestBody, type SignupRequestBody } from "@shared/api/authRequest";
import type { JWT, OAuthCallBackBody } from "@shared/api";
import { parseJWT } from "@shared/api";
import { acceptFriendRequest, getFriends, getUser, getUsers, removeFriendship, sendFriendRequest, updateUser } from "./user";
import { goto } from "$app/navigation";
import { AppUser } from "./appUser";
// import { io, type Socket } from "socket.io-client"

export type ApiError = {
  code: number,
  message: string,
};

export type Session = {
  user: User,
  auth: AuthUserClient,
}

export class ApiClient {
  private readonly userStore: Writable<User | null> = new Writable('user');
  private readonly authStore: Writable<AuthUserClient | null> = new Writable('auth');
  private readonly accessToken: Writable<JWT | null> = new Writable('token');
  private listeners: Set<Function> = new Set();
  private avatarUrl?: string;
  // private socket: Socket | null = null;

  constructor() {}

  async init() {
    try {
      const [user, auth] = await Promise.all([
        this.getUser(),
        this.getAuth(),
      ])
      this.userStore.set(user);
      this.authStore.set(auth);
      this.notify();
    } catch (e: any) {
      console.error(e);
    }
    return this;
  }

  get user(): User | null {
    return this.userStore.get() ?? null;
  }

  get avatar() {
    return this.avatarUrl;
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
    const response = await this.getUser();
    let user = response.user as User;
    this.userStore.set(user);
    const data = await this.getAuth();
    let auth = data.auth as AuthUserClient;
    this.authStore.set(auth);
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

  async signup(info: SignupRequestBody) {
    try {
      const response = await signupRequest(this.accessToken, info);
      this.auth = response.auth;
      this.user = await this.getUser()
      this.notify();
    } catch (e: any) {
      const error = new Error(`Signup Failed: ${e.message || e}`)
      console.error(error);
      throw error;
    }
  }

  async getAuth(): Promise<any> {
    return await getAuth(this.accessToken);
  }

  async getUser(): Promise<any> {
    const response = await getUser(this.accessToken);
    const avatar = response.avatar;
    console.log(avatar);
    if (avatar)
      this.avatarUrl = response.avatar.location;
    return response;
  }

  async getUsers(): Promise<AppUser[]> {
    const response = await getUsers(this.accessToken);
    const users = response.users?.map((f: { user: User, avatar: Avatar }) => new AppUser(f.user, f.avatar ?? null));
    return users;
  }

  async getFriends(): Promise<{ friends: AppUser[], friendships: Friendship[] }> {
    const data = await getFriends(this.accessToken);
    const friends = data.friends?.map((f: { user: User, avatar: Avatar }) => new AppUser(f.user, f.avatar ?? null));
    return { friends: friends, friendships: data.friendships };
  }

  async sendFriendRequest(friendId: number): Promise<Friendship> {
    const response = await sendFriendRequest(this.accessToken, friendId);

    return response.friendship;
  }

  async acceptFriendRequest(reqId: number) {
    return await acceptFriendRequest(this.accessToken, reqId);
  }

  async removeFriendship(friendshipId: number) {
    await removeFriendship(this.accessToken, friendshipId);
  }

  async login(info: LoginRequestBody) {
    try {
      const authResponse = await loginRequest(info);
      this.authStore.set(authResponse.auth)
      if (authResponse.access_token) {
        const jwt = parseJWT(authResponse.access_token);
        this.accessToken.set(jwt);
        const response = await getUser(this.accessToken)
        this.userStore.set(response.user);
        this.notify();
        // this.connectsocket();
      }
    } catch (e: any) {
      const error = new Error(`Login Failed: ${e.message || e}`)
      console.error(error);
      throw error;
    }
  }

  // getSocket(): Socket | null {
  //   return this.socket;
  // }
  //
  // disconnect(): void {
  //   if (this.socket) {
  //     this.socket.disconnect();
  //     this.socket = null;
  //   }
  // }
  //
  // private connectsocket() {
  //   this.socket = io('http://localhost:8080/api/user/ws');
  //
  //   this.socket.on('connect', () => {
  //     console.log('Socket connected:', this.socket?.id);
  //   });
  //
  //   this.socket.on('disconnect', () => {
  //     console.log('Socket disconnected');
  //   });
  // }
  //
  async oauth(code: OAuthCallBackBody) {
    try {
      const authResponse = await oauthRequest(code); // this contains the access_token

      this.auth = authResponse.auth;

      this.authStore.set(authResponse.auth)
      if (authResponse.access_token) {
        const jwt = parseJWT(authResponse.access_token);
        this.accessToken.set(jwt);
        const response = await getUser(this.accessToken)
        this.userStore.set(response.user);
        this.notify();
      }
    } catch (e: any) {
      const error = new Error(`OAuth Failed: ${e.message || e}`)
      console.error(error);
      throw error;
    }
  }

  async logout() {
    try {
      await logoutRequest(this.accessToken);
      this.clearSession();
      this.notify();
      goto('/auth');
    } catch (e: any) {
      console.error(e);
    }
  }

  clearListeners() {
    this.listeners.clear();
  }

  get authHeader(): string {
    return `Bearer ${this.accessToken.get()?.raw}`;
  }

  set jwt(jwt: JWT) {
    this.accessToken.set(jwt);
  }

  clearSession() {
    this.userStore.set(null);
    this.authStore.set(null);
    this.accessToken.set(null);
    this.accessToken.delete();
    document.cookie = '';
  }

  async delete() {
    await deleteRequest(this.accessToken);
    this.clearSession();
    goto('/auth');
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

  async updateUserInfo(newUser: Partial<User>, avatar?: File): Promise<User> {
    const data = await updateUser(this.accessToken, newUser, avatar);

    if (data.avatar) {
      this.avatarUrl = data.avatar.location;
    }
    this.userStore.set(data.user);
    return data.user;
  }
}
