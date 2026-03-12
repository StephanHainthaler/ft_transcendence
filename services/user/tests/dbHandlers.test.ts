import { describe, test, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { DB, defineTable, int, text, eq } from "@server/orm";

// Test schema matching user service
interface TestSchema {
  users: { id: number; name: string; user_name: string | null };
  avatars: { id: number; user_id: number; location: string };
  friendships: { id: number; user_from_id: number; user_to_id: number; status: string };
}

let db: DB<TestSchema>;

beforeEach(() => {
  db = new DB<TestSchema>(":memory:");

  const users = defineTable("users", {
    id: int().primarykey().autoIncrement().notNull(),
    name: text().notNull(),
    user_name: text().unique(),
  });

  const avatars = defineTable("avatars", {
    id: int().primarykey().autoIncrement().notNull(),
    user_id: int().notNull().references(() => users.columns.id),
    location: text().notNull(),
  });

  const friendships = defineTable("friendships", {
    id: int().notNull().primarykey().autoIncrement(),
    user_from_id: int().notNull().references(() => users.columns.id),
    user_to_id: int().notNull().references(() => users.columns.id),
    status: text().notNull(),
  });

  db.create([users, avatars, friendships]);
});

describe("User CRUD Operations", () => {
  test("should create a user", () => {
    const user = db.from("users").insert({ name: "Alice" }).select("*").single();

    assert.ok(user);
    assert.strictEqual(user.name, "Alice");
    assert.ok(user.id > 0);
  });

  test("should create user with username", () => {
    const user = db.from("users").insert({ name: "Bob", user_name: "bob123" }).select("*").single();

    assert.ok(user);
    assert.strictEqual(user.user_name, "bob123");
  });

  test("should reject duplicate usernames", () => {
    db.from("users").insert({ name: "User1", user_name: "unique" }).run();

    assert.throws(() => {
      db.from("users").insert({ name: "User2", user_name: "unique" }).run();
    });
  });

  test("should get user by id", () => {
    const created = db.from("users").insert({ name: "Charlie" }).select("*").single()!;
    const fetched = db.from("users").select("*").where(eq("id", created.id)).single();

    assert.ok(fetched);
    assert.strictEqual(fetched.id, created.id);
    assert.strictEqual(fetched.name, "Charlie");
  });

  test("should return null for non-existent user", () => {
    const user = db.from("users").select("*").where(eq("id", 9999)).single();
    assert.strictEqual(user, null);
  });

  test("should update user name", () => {
    const user = db.from("users").insert({ name: "OldName" }).select("*").single()!;

    db.from("users").update({ name: "NewName" }).where(eq("id", user.id)).run();

    const updated = db.from("users").select("*").where(eq("id", user.id)).single();
    assert.strictEqual(updated!.name, "NewName");
  });

  test("should delete user", () => {
    const user = db.from("users").insert({ name: "ToDelete" }).select("*").single()!;

    db.from("users").delete().where(eq("id", user.id)).run();

    const deleted = db.from("users").select("*").where(eq("id", user.id)).single();
    assert.strictEqual(deleted, null);
  });
});

describe("Avatar Operations", () => {
  test("should create avatar for user", () => {
    const user = db.from("users").insert({ name: "User" }).select("*").single()!;
    const avatar = db
      .from("avatars")
      .insert({ user_id: user.id, location: "/avatars/test.png" })
      .select("*")
      .single();

    assert.ok(avatar);
    assert.strictEqual(avatar.user_id, user.id);
    assert.strictEqual(avatar.location, "/avatars/test.png");
  });

  test("should get avatar by user_id", () => {
    const user = db.from("users").insert({ name: "User" }).select("*").single()!;
    db.from("avatars").insert({ user_id: user.id, location: "/test.png" }).run();

    const avatar = db.from("avatars").select("*").where(eq("user_id", user.id)).single();

    assert.ok(avatar);
    assert.strictEqual(avatar.user_id, user.id);
  });

  test("should return null for user without avatar", () => {
    const user = db.from("users").insert({ name: "NoAvatar" }).select("*").single()!;
    const avatar = db.from("avatars").select("*").where(eq("user_id", user.id)).single();

    assert.strictEqual(avatar, null);
  });

  test("should update avatar location", () => {
    const user = db.from("users").insert({ name: "User" }).select("*").single()!;
    const avatar = db
      .from("avatars")
      .insert({ user_id: user.id, location: "/old.png" })
      .select("*")
      .single()!;

    db.from("avatars").update({ location: "/new.png" }).where(eq("id", avatar.id)).run();

    const updated = db.from("avatars").select("*").where(eq("id", avatar.id)).single();
    assert.strictEqual(updated!.location, "/new.png");
  });

  test("should delete avatar", () => {
    const user = db.from("users").insert({ name: "User" }).select("*").single()!;
    const avatar = db
      .from("avatars")
      .insert({ user_id: user.id, location: "/todelete.png" })
      .select("*")
      .single()!;

    db.from("avatars").delete().where(eq("id", avatar.id)).run();

    const deleted = db.from("avatars").select("*").where(eq("id", avatar.id)).single();
    assert.strictEqual(deleted, null);
  });
});

describe("Friendship Operations", () => {
  let user1Id: number;
  let user2Id: number;

  beforeEach(() => {
    user1Id = db.from("users").insert({ name: "User1" }).select("*").single()!.id;
    user2Id = db.from("users").insert({ name: "User2" }).select("*").single()!.id;
  });

  test("should create friendship request", () => {
    const friendship = db
      .from("friendships")
      .insert({ user_from_id: user1Id, user_to_id: user2Id, status: "pending" })
      .select("*")
      .single();

    assert.ok(friendship);
    assert.strictEqual(friendship.user_from_id, user1Id);
    assert.strictEqual(friendship.user_to_id, user2Id);
    assert.strictEqual(friendship.status, "pending");
  });

  test("should update friendship status to accepted", () => {
    const friendship = db
      .from("friendships")
      .insert({ user_from_id: user1Id, user_to_id: user2Id, status: "pending" })
      .select("*")
      .single()!;

    db.from("friendships").update({ status: "accepted" }).where(eq("id", friendship.id)).run();

    const updated = db.from("friendships").select("*").where(eq("id", friendship.id)).single();
    assert.strictEqual(updated!.status, "accepted");
  });

  test("should get friendships for user", () => {
    db.from("friendships").insert({ user_from_id: user1Id, user_to_id: user2Id, status: "accepted" }).run();

    const sentRequests = db.from("friendships").select("*").where(eq("user_from_id", user1Id)).all();

    assert.strictEqual(sentRequests.length, 1);
    assert.strictEqual(sentRequests[0].user_to_id, user2Id);
  });

  test("should delete friendship", () => {
    const friendship = db
      .from("friendships")
      .insert({ user_from_id: user1Id, user_to_id: user2Id, status: "pending" })
      .select("*")
      .single()!;

    db.from("friendships").delete().where(eq("id", friendship.id)).run();

    const deleted = db.from("friendships").select("*").where(eq("id", friendship.id)).single();
    assert.strictEqual(deleted, null);
  });
});

describe("User with Avatar Query", () => {
  test("should get user with associated avatar", () => {
    const user = db.from("users").insert({ name: "UserWithAvatar" }).select("*").single()!;
    db.from("avatars").insert({ user_id: user.id, location: "/avatar.png" }).run();

    const fetchedUser = db.from("users").select("*").where(eq("id", user.id)).single();
    const fetchedAvatar = db.from("avatars").select("*").where(eq("user_id", user.id)).single();

    assert.ok(fetchedUser);
    assert.ok(fetchedAvatar);
    assert.strictEqual(fetchedAvatar.user_id, fetchedUser.id);
  });

  test("should handle user without avatar gracefully", () => {
    const user = db.from("users").insert({ name: "UserNoAvatar" }).select("*").single()!;

    const fetchedUser = db.from("users").select("*").where(eq("id", user.id)).single();
    const fetchedAvatar = db.from("avatars").select("*").where(eq("user_id", user.id)).single();

    assert.ok(fetchedUser);
    assert.strictEqual(fetchedAvatar, null);
  });
});

describe("Edge Cases", () => {
  test("should handle empty name", () => {
    // Depending on constraints, this might throw or succeed
    assert.throws(() => {
      db.from("users").insert({ name: null as any }).run();
    });
  });

  test("should handle special characters in name", () => {
    const specialName = "User <script>alert('xss')</script>";
    const user = db.from("users").insert({ name: specialName }).select("*").single();

    assert.ok(user);
    assert.strictEqual(user.name, specialName);
  });

  test("should handle unicode in name", () => {
    const unicodeName = "用户名 🎮";
    const user = db.from("users").insert({ name: unicodeName }).select("*").single();

    assert.ok(user);
    assert.strictEqual(user.name, unicodeName);
  });

  test("should handle very long name", () => {
    const longName = "A".repeat(1000);
    const user = db.from("users").insert({ name: longName }).select("*").single();

    assert.ok(user);
    assert.strictEqual(user.name, longName);
  });
});
