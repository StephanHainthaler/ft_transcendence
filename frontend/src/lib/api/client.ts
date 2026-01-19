import { Writable } from "@lib/types/writable";
import type { AuthUserClient, Avatar, Friendship, User } from "@shared/user";
import { deleteRequest, getAuth, loginRequest, logoutRequest, oauthRequest, signupRequest, updateRequest } from "./auth";
import { type LoginRequestBody, type SignupRequestBody } from "@shared/api/authRequest";
import { fetchUserStats, fetchMatchHistory, fetchLeaderboard } from "@lib/api/gameStats";
import type { UserStats, MatchHistoryEntry } from "@shared/game_stats";
import type { JWT, OAuthCallBackBody } from "@shared/api";
import { parseJWT } from "@shared/api";
import { acceptFriendRequest, getFriends, getUser, getUsers, removeFriendship, sendFriendRequest, updateUser } from "./user";
import { goto } from "$app/navigation";
import { AppUser } from "./appUser";

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
  private avatarUrl?: string;

  constructor() {}

  async init() {
    try {
      const [userResponse, authResponse] = await Promise.all([
        this.getUser(),
        this.getAuth(),
      ])
      this.userStore.set(userResponse.user);
      this.authStore.set(authResponse.auth);
    } catch (e: any) {
      console.error(e);
    }
    return this;
  }

  /* FRONTEND USAGE */

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

  get isLoggedIn(): boolean {
    return !!(this.user && this.auth);
  }

  get session(): Session | null {
    if (!this.isLoggedIn) return null;
    return { auth: this.auth!, user: this.user! };
  }

  /* USER API */

  async getSession(): Promise<Session> {
    const response = await this.getUser();
    let user = response.user as User;
    this.userStore.set(user);
    const data = await this.getAuth();
    let auth = data.auth as AuthUserClient;
    this.authStore.set(auth);
    return { auth, user }
  }

  async getAuth(): Promise<any> {
    return await getAuth(this.accessToken);
  }

  async getUser(): Promise<any> {
    const response = await getUser(this.accessToken);
    const avatar = response.avatar;
    if (response.user)
      this.userStore.set(response.user);
    if (avatar)
      this.avatarUrl = response.avatar.location;
    return response;
  }

  async getUsers(): Promise<AppUser[]> {
    const response = await getUsers(this.accessToken);
    const users = response.users?.map((f: { user: User, avatar: Avatar }) => new AppUser(f.user, f.avatar ?? null));
    return users;
  }

  /* FRIEND API */

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

  /* USER STATS */
  async getUserStats(userId: number, page: number = 1): Promise<UserStats | null> {
    return await fetchUserStats(this.accessToken, userId);
  }

  async getMatchHistory(userId: number, page: number = 1): Promise<MatchHistoryEntry[] | []> {
    return await fetchMatchHistory(this.accessToken, userId);
  }

  async getLeaderboard(page: number = 1): Promise<UserStats[] | []> {
    return await fetchLeaderboard(this.accessToken, page);
  }

  /* AUTH API */

  async signup(info: SignupRequestBody) {
    try {
      const response = await signupRequest(this.accessToken, info);
      this.auth = response.auth;
      const userResponse = await this.getUser();
      this.user = userResponse.user;
    } catch (e: any) {
      const error = new Error(`Signup Failed: ${e.message || e}`)
      console.error(error);
      throw error;
    }
  }


  async login(info: LoginRequestBody) {
    try {
      const authResponse = await loginRequest(this.accessToken, info);
      this.authStore.set(authResponse.auth)
      if (authResponse.access_token) {
        const jwt = parseJWT(authResponse.access_token);
        this.accessToken.set(jwt);
        const response = await getUser(this.accessToken)
        this.userStore.set(response.user);
      }
    } catch (e: any) {
      const error = new Error(`Login Failed: ${e.message || e}`)
      console.error(error);
      throw error;
    }
  }

  async oauth(code: OAuthCallBackBody) {
    try {
      const authResponse = await oauthRequest(this.accessToken, code);
      this.auth = authResponse.auth;

      this.authStore.set(authResponse.auth)
      if (authResponse.access_token) {
        const response = await getUser(this.accessToken)
        this.userStore.set(response.user);
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
      goto('/auth');
    } catch (e: any) {
      console.error(e);
    }
  }

  set jwt(jwt: JWT) {
    this.accessToken.set(jwt);
  }

  clearSession() {
    this.userStore.set(null);
    this.authStore.set(null);
    this.accessToken.set(null);
    document.cookie = '';
  }

  async delete() {
    await deleteRequest(this.accessToken);
    this.clearSession();
    goto('/auth');
  }

  /* PERSONAL INFO */

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
