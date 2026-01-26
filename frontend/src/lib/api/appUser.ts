import type { Avatar, User } from "@shared/user";

export class AppUser {
  constructor(public user: User, public avatar: Avatar | null) {}

  get name() {
    return this.user.name;
  }

  get displayName() {
    return this.user.username || this.user.name;
  }

  get id() {
    return this.user.id;
  }

  get avatarUrl() {
    if (this.avatar)
      return `${this.avatar?.location}`;
  }
}
