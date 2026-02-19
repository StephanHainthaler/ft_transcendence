import { Writable } from "@lib/types/writable";
import type { AuthUserClient, Avatar, Friendship, User } from "@shared/user";
import { deleteRequest, getAuth, loginRequest, logoutRequest, oauthRequest, signupRequest, updateRequest } from "./auth";
import { type LoginRequestBody, type SignupRequestBody } from "@shared/api/authRequest";
import { fetchUserStats, fetchMatchHistory, fetchLeaderboard, sendMatchResults } from "@lib/api/gameStats";
import type { UserStats, MatchHistoryEntry, MatchSubmissionData } from "@shared/game_stats";
import type { OAuthCallBackBody } from "@shared/api";
import { acceptFriendRequest, checkFriendsOnlineStatus, getFriends, getUser, getUsers, removeFriendship, sendFriendRequest, updateUser } from "./user";
import { goto } from "$app/navigation";
import { AppUser } from "./appUser";
import { toast } from "svelte-sonner";

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
  private avatarUrl?: string = $state(undefined);
  private currentOnlineFriends: number[] = $state([]);
  private onlineInterval: ReturnType<typeof setInterval> | null = null;
  loggedIn: boolean = $state(false);

  constructor() {}

  async init() {
    try {
      if (!!(this.user && this.auth)) {
        const userResponse = await this.getUser();
        const authResponse = await this.getAuth();
        this.userStore.set(userResponse.user);
        this.authStore.set(authResponse.auth);
        this.loggedIn = true;
      } else {
        this.loggedIn = false;
      }
      this.onlineInterval = setInterval(async () => {
        await this.checkOnlineStatus()
      }, 10 * 1000);
    } catch (e: any) {
      toast.error(e.message || e);
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

  get onlineFriends(): number[] {
    return this.currentOnlineFriends;
  }

  get isLoggedIn(): boolean {
    const auth_user = !!(this.user && this.auth)
    const logStatus = auth_user && this.loggedIn;
    return logStatus;
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
    this.loggedIn = true;
    return { auth, user }
  }

  async getAuth(): Promise<any> {
    return await getAuth();
  }

  async getUser(): Promise<any> {
    const response = await getUser();
    const avatar = response.avatar;
    if (response.user)
      this.userStore.set(response.user);
    if (avatar)
      this.avatarUrl = response.avatar.location;
    return response;
  }

  async getUsers(): Promise<AppUser[]> {
    const response = await getUsers();
    const users = response.users?.map((f: { user: User, avatar: Avatar }) => new AppUser(f.user, f.avatar ?? null));
    return users;
  }

  /* FRIEND API */

  async getFriends(): Promise<{ friends: AppUser[], friendships: Friendship[] }> {
    const data = await getFriends();
    const friends = data.friends?.map((f: { user: User, avatar: Avatar }) => new AppUser(f.user, f.avatar ?? null));
    return { friends: friends, friendships: data.friendships };
  }

  async sendFriendRequest(friendId: number): Promise<Friendship> {
    const response = await sendFriendRequest(friendId);

    return response.friendship;
  }

  async acceptFriendRequest(reqId: number) {
    return await acceptFriendRequest(reqId);
  }

  async removeFriendship(friendshipId: number) {
    await removeFriendship(friendshipId);
  }

  checkOnlineStatus = async () => {
    try {
      if (!this.isLoggedIn) return;
      const data = await checkFriendsOnlineStatus();
      this.currentOnlineFriends = data.sessions
    } catch {}
  }

  /* USER STATS */
  async getUserStats(userId: number): Promise<UserStats | null> {
    return await fetchUserStats(userId);
  }

  async getMatchHistory(userId: number, page: number = 1): Promise<MatchHistoryEntry[] | []> {
    return await fetchMatchHistory(userId, page);
  }

  async getLeaderboard(page: number = 1): Promise<UserStats[] | []> {
    return await fetchLeaderboard(page);
  }

  async sendMatchResults(matchData: MatchSubmissionData) {
    return await sendMatchResults(matchData);
  }

  /* AUTH API */

  async signup(info: SignupRequestBody) {
    try {
      const response = await signupRequest(info);
      this.auth = response.auth;
      const userResponse = await this.getUser();
      this.user = userResponse.user;
      this.loggedIn = true;
    } catch (e: any) {
      const error = new Error(`Signup Failed: ${e.message || e}`)
      toast.error(error.message);
      throw error;
    }
  }


  async login(info: LoginRequestBody) {
    try {
      const authResponse = await loginRequest(info);
      this.authStore.set(authResponse.auth)
      const response = await getUser()
      this.userStore.set(response.user);
      this.loggedIn = true;
    } catch (e: any) {
      const error = new Error(`Login Failed: ${e.message || e}`)
      toast.error(error.message);
      throw error;
    }
  }

  async oauth(code: OAuthCallBackBody) {
    try {
      const authResponse = await oauthRequest(code);
      this.auth = authResponse.auth;

      this.authStore.set(authResponse.auth)
      const response = await getUser()
      this.userStore.set(response.user);
      this.loggedIn = true;
    } catch (e: any) {
      const error = new Error(`OAuth Failed: ${e.message || e}`)
      throw error;
    }
  }

  async logout() {
    try {
      this.clearSession();
      await logoutRequest();
      goto('/auth');
    } catch (e: any) {
      console.log(e);
      throw e;
    }
  }

  clearSession() {
    this.userStore.delete();
    this.authStore.delete();
    this.loggedIn = false;
    if (this.onlineInterval) {
      clearInterval(this.onlineInterval);
      this.onlineInterval = null;
    }
  }

  async delete() {
    await deleteRequest();
    this.clearSession();
    goto('/auth');
  }

  /* PERSONAL INFO */

  async updateCredentials({
    email, user_name, passwd
  }: {
    email?: string, user_name?: string, passwd?: string
  }) {
    if (!email && !user_name && !passwd) {
      throw new Error("No Credentials to update!");
    }
    try {
      const authResponse = await updateRequest({
        email, user_name, passwd
      });
      this.authStore.set(authResponse.auth)
    } catch (e: any) {
      const error = new Error(`${e.message || e}`)
      throw error;
    }
  }

  async updateUserInfo(newUser: Partial<User>, avatar?: File): Promise<User> {
    const data = await updateUser(newUser, avatar);

    if (data.avatar) {
      this.avatarUrl = data.avatar.location;
    }
    this.userStore.set(data.user);
    return data.user;
  }
}
