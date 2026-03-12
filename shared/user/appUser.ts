import type { Avatar, User } from "./index";

export class AppUser {
  constructor(public user: User, public avatar: Avatar | null) {}

  get name() {
    return this.user.name;
  }

  get displayName() {
    return String(this.user.username || this.user.name);
  }

  get id() {
    return this.user.id;
  }

  get avatarUrl() {
    if (this.avatar)
      return `${this.avatar?.location}`;
  }
}
