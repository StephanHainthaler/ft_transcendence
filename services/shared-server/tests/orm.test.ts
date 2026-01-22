import { describe, test, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { DB, defineTable, int, text, eq, ne, gt, lt, ge, le, IN } from "../orm";

interface TestSchema {
  users: { id: number; name: string; age: number; email: string };
  posts: { id: number; title: string; user_id: number; views: number };
}

let db: DB<TestSchema>;
let usersTable: ReturnType<typeof defineTable>;
let postsTable: ReturnType<typeof defineTable>;

beforeEach(() => {
  db = new DB<TestSchema>(":memory:");

  usersTable = defineTable("users", {
    id: int().primarykey().autoIncrement().notNull(),
    name: text().notNull(),
    age: int().notNull(),
    email: text().unique().notNull(),
  });

  postsTable = defineTable("posts", {
    id: int().primarykey().autoIncrement().notNull(),
    title: text().notNull(),
    user_id: int().notNull().references(() => usersTable.columns.id),
    views: int().notNull().default(0),
  });

  db.create([usersTable, postsTable]);
});

describe("Table Creation", () => {
  test("should create table with columns", () => {
    const newDb = new DB<{ test: { id: number; name: string } }>(":memory:");
    const testTable = defineTable("test_create", {
      id: int().primarykey().notNull(),
      name: text().notNull(),
    });

    assert.doesNotThrow(() => {
      newDb.create(testTable);
    });
  });

  test("should reject recreating existing table", () => {
    assert.throws(() => {
      db.create(usersTable);
    });
  });

  test("should create table with all column constraints", () => {
    const newDb = new DB<{ full: { id: number; name: string; count: number } }>(":memory:");
    const fullTable = defineTable("full_constraints", {
      id: int().primarykey().autoIncrement().notNull(),
      name: text().unique().notNull(),
      count: int().notNull().default(0),
    });

    assert.doesNotThrow(() => {
      newDb.create(fullTable);
    });
  });

  test("should create table with foreign key reference", () => {
    const newDb = new DB<{
      parent: { id: number };
      child: { id: number; parent_id: number };
    }>(":memory:");

    const parentTable = defineTable("parent", {
      id: int().primarykey().autoIncrement().notNull(),
    });

    const childTable = defineTable("child", {
      id: int().primarykey().autoIncrement().notNull(),
      parent_id: int().notNull().references(() => parentTable.columns.id),
    });

    assert.doesNotThrow(() => {
      newDb.create([parentTable, childTable]);
    });
  });
});

describe("INSERT Operations", () => {
  test("should insert a single row", () => {
    const result = db.from("users").insert({
      name: "John",
      age: 30,
      email: "john@test.com",
    }).run();

    assert.ok(result.changes > 0);
  });

  test("should insert and return the inserted row", () => {
    const user = db.from("users").insert({
      name: "Jane",
      age: 25,
      email: "jane@test.com",
    }).select("*").single();

    assert.ok(user);
    assert.strictEqual(user.name, "Jane");
    assert.strictEqual(user.age, 25);
  });

  test("should auto-increment primary key", () => {
    const user1 = db.from("users").insert({
      name: "User1",
      age: 20,
      email: "user1@test.com",
    }).select("*").single();

    const user2 = db.from("users").insert({
      name: "User2",
      age: 21,
      email: "user2@test.com",
    }).select("*").single();

    assert.ok(user1!.id < user2!.id);
  });

  test("should reject invalid column names", () => {
    assert.throws(() => {
      db.from("users").insert({
        invalid_column: "value",
      } as any).run();
    });
  });

  test("should use default values", () => {
    // Insert user first for foreign key
    db.from("users").insert({
      name: "Author",
      age: 30,
      email: "author@test.com",
    }).run();

    const post = db.from("posts").insert({
      title: "Test Post",
      user_id: 1,
    }).select("*").single();

    assert.strictEqual(post!.views, 0);
  });
});

describe("SELECT Operations", () => {
  beforeEach(() => {
    db.from("users").insert({ name: "Alice", age: 30, email: "alice@test.com" }).run();
    db.from("users").insert({ name: "Bob", age: 25, email: "bob@test.com" }).run();
    db.from("users").insert({ name: "Charlie", age: 35, email: "charlie@test.com" }).run();
  });

  test("should select all rows with *", () => {
    const users = db.from("users").select("*").all();
    assert.strictEqual(users.length, 3);
  });

  test("should select specific columns", () => {
    const users = db.from("users").select("name", "age").all();
    assert.ok(users.every(u => "name" in u && "age" in u));
  });

  test("should return single row with single()", () => {
    const user = db.from("users").select("*").single();
    assert.ok(user);
    assert.ok("name" in user);
  });

  test("should return null for no match with single()", () => {
    const user = db.from("users").select("*").where(eq("name", "NonExistent")).single();
    assert.strictEqual(user, null);
  });
});

describe("WHERE Clauses", () => {
  beforeEach(() => {
    db.from("users").insert({ name: "Alice", age: 30, email: "alice@test.com" }).run();
    db.from("users").insert({ name: "Bob", age: 25, email: "bob@test.com" }).run();
    db.from("users").insert({ name: "Charlie", age: 35, email: "charlie@test.com" }).run();
    db.from("users").insert({ name: "Diana", age: 30, email: "diana@test.com" }).run();
  });

  test("eq() should match exact value", () => {
    const users = db.from("users").select("*").where(eq("age", 30)).all();
    assert.strictEqual(users.length, 2);
    assert.ok(users.every(u => u.age === 30));
  });

  test("ne() should exclude value", () => {
    const users = db.from("users").select("*").where(ne("age", 30)).all();
    assert.strictEqual(users.length, 2);
    assert.ok(users.every(u => u.age !== 30));
  });

  test("gt() should find greater than", () => {
    const users = db.from("users").select("*").where(gt("age", 30)).all();
    assert.strictEqual(users.length, 1);
    assert.strictEqual(users[0].name, "Charlie");
  });

  test("lt() should find less than", () => {
    const users = db.from("users").select("*").where(lt("age", 30)).all();
    assert.strictEqual(users.length, 1);
    assert.strictEqual(users[0].name, "Bob");
  });

  test("ge() should find greater than or equal", () => {
    const users = db.from("users").select("*").where(ge("age", 30)).all();
    assert.strictEqual(users.length, 3);
  });

  test("le() should find less than or equal", () => {
    const users = db.from("users").select("*").where(le("age", 30)).all();
    assert.strictEqual(users.length, 3);
  });

  test("IN() should match multiple values", () => {
    const users = db.from("users").select("*").where(IN("name", ["Alice", "Bob"])).all();
    assert.strictEqual(users.length, 2);
  });

  test("and() should combine conditions", () => {
    const users = db.from("users").select("*").where(eq("age", 30)).and(eq("name", "Alice")).all();
    assert.strictEqual(users.length, 1);
    assert.strictEqual(users[0].name, "Alice");
  });

  test("or() should match either condition", () => {
    const users = db.from("users").select("*").where(eq("name", "Alice")).or(eq("name", "Bob")).all();
    assert.strictEqual(users.length, 2);
  });

  test("should reject multiple where() calls", () => {
    assert.throws(() => {
      db.from("users").select("*").where(eq("age", 30)).where(eq("name", "Alice")).all();
    }, /Only a single WHERE clause/);
  });
});

describe("ORDER BY", () => {
  beforeEach(() => {
    db.from("users").insert({ name: "Alice", age: 30, email: "alice@test.com" }).run();
    db.from("users").insert({ name: "Bob", age: 25, email: "bob@test.com" }).run();
    db.from("users").insert({ name: "Charlie", age: 35, email: "charlie@test.com" }).run();
  });

  test("asc() should sort ascending", () => {
    const users = db.from("users").select("*").asc("age").all();
    assert.strictEqual(users[0].name, "Bob");
    assert.strictEqual(users[2].name, "Charlie");
  });

  test("desc() should sort descending", () => {
    const users = db.from("users").select("*").desc("age").all();
    assert.strictEqual(users[0].name, "Charlie");
    assert.strictEqual(users[2].name, "Bob");
  });
});

describe("LIMIT and OFFSET", () => {
  beforeEach(() => {
    for (let i = 1; i <= 10; i++) {
      db.from("users").insert({
        name: `User${i}`,
        age: 20 + i,
        email: `user${i}@test.com`,
      }).run();
    }
  });

  test("limit() should restrict number of results", () => {
    const users = db.from("users").select("*").limit(3).all();
    assert.strictEqual(users.length, 3);
  });

  test("offset() should skip rows", () => {
    const allUsers = db.from("users").select("*").all();
    const offsetUsers = db.from("users").select("*").offset(5).all();
    assert.strictEqual(offsetUsers.length, 5);
    assert.strictEqual(offsetUsers[0].id, allUsers[5].id);
  });

  test("limit() and offset() together for pagination", () => {
    const page1 = db.from("users").select("*").asc("id").limit(3).all();
    const page2 = db.from("users").select("*").asc("id").limit(3).offset(3).all();
    const page3 = db.from("users").select("*").asc("id").limit(3).offset(6).all();

    assert.strictEqual(page1.length, 3);
    assert.strictEqual(page2.length, 3);
    assert.strictEqual(page3.length, 3);
    assert.notStrictEqual(page1[0].id, page2[0].id);
    assert.notStrictEqual(page2[0].id, page3[0].id);
  });
});

describe("UPDATE Operations", () => {
  beforeEach(() => {
    db.from("users").insert({ name: "Alice", age: 30, email: "alice@test.com" }).run();
    db.from("users").insert({ name: "Bob", age: 25, email: "bob@test.com" }).run();
  });

  test("should update rows matching condition", () => {
    db.from("users").update({ age: 31 }).where(eq("name", "Alice")).run();

    const user = db.from("users").select("*").where(eq("name", "Alice")).single();
    assert.strictEqual(user!.age, 31);
  });

  test("should return updated row with select()", () => {
    const updated = db.from("users")
      .update({ age: 26 })
      .where(eq("name", "Bob"))
      .select("*")
      .single();

    assert.strictEqual(updated!.age, 26);
  });

  test("should update multiple columns", () => {
    db.from("users")
      .update({ name: "Alice Updated", age: 32 })
      .where(eq("email", "alice@test.com"))
      .run();

    const user = db.from("users").select("*").where(eq("email", "alice@test.com")).single();
    assert.strictEqual(user!.name, "Alice Updated");
    assert.strictEqual(user!.age, 32);
  });

  test("should reject update without constraint", () => {
    assert.throws(() => {
      db.from("users").update({ age: 50 }).run();
    }, /Missing constraint/);
  });

  test("should ignore undefined values in update", () => {
    const originalUser = db.from("users").select("*").where(eq("name", "Alice")).single();

    db.from("users")
      .update({ name: undefined, age: 99 } as any)
      .where(eq("id", originalUser!.id))
      .run();

    const updated = db.from("users").select("*").where(eq("id", originalUser!.id)).single();
    assert.strictEqual(updated!.name, "Alice"); // Should remain unchanged
    assert.strictEqual(updated!.age, 99);
  });
});

describe("DELETE Operations", () => {
  beforeEach(() => {
    db.from("users").insert({ name: "Alice", age: 30, email: "alice@test.com" }).run();
    db.from("users").insert({ name: "Bob", age: 25, email: "bob@test.com" }).run();
    db.from("users").insert({ name: "Charlie", age: 35, email: "charlie@test.com" }).run();
  });

  test("should delete rows matching condition", () => {
    db.from("users").delete().where(eq("name", "Alice")).run();

    const users = db.from("users").select("*").all();
    assert.strictEqual(users.length, 2);
    assert.ok(!users.some(u => u.name === "Alice"));
  });

  test("should delete multiple matching rows", () => {
    db.from("users").delete().where(ge("age", 30)).run();

    const users = db.from("users").select("*").all();
    assert.strictEqual(users.length, 1);
    assert.strictEqual(users[0].name, "Bob");
  });

  test("should reject delete without constraint", () => {
    assert.throws(() => {
      db.from("users").delete().run();
    }, /Missing constraint/);
  });
});

describe("SQL Injection Prevention", () => {
  beforeEach(() => {
    db.from("users").insert({ name: "Safe User", age: 30, email: "safe@test.com" }).run();
  });

  test("should prevent injection in WHERE clause", () => {
    const maliciousName = "'; DROP TABLE users; --";
    const user = db.from("users").select("*").where(eq("name", maliciousName)).single();

    assert.strictEqual(user, null);

    // Verify table still exists
    const allUsers = db.from("users").select("*").all();
    assert.strictEqual(allUsers.length, 1);
  });

  test("should prevent injection in INSERT values", () => {
    const maliciousValue = "'; DELETE FROM users; --";

    db.from("users").insert({
      name: maliciousValue,
      age: 25,
      email: "malicious@test.com",
    }).run();

    const user = db.from("users").select("*").where(eq("name", maliciousValue)).single();
    assert.ok(user);
    assert.strictEqual(user.name, maliciousValue);

    // Verify no data was deleted
    const allUsers = db.from("users").select("*").all();
    assert.strictEqual(allUsers.length, 2);
  });

  test("should prevent OR injection attack", () => {
    const maliciousInput = "anything' OR '1'='1";
    const users = db.from("users").select("*").where(eq("name", maliciousInput)).all();

    // Should not return all users
    assert.strictEqual(users.length, 0);
  });

  test("should prevent UNION injection attack", () => {
    const maliciousInput = "' UNION SELECT * FROM users --";
    const user = db.from("users").select("*").where(eq("name", maliciousInput)).single();

    assert.strictEqual(user, null);
  });
});

describe("Query Builder Chaining", () => {
  beforeEach(() => {
    for (let i = 1; i <= 20; i++) {
      db.from("users").insert({
        name: `User${i}`,
        age: 20 + (i % 10),
        email: `user${i}@test.com`,
      }).run();
    }
  });

  test("should chain multiple operations correctly", () => {
    const users = db.from("users")
      .select("*")
      .where(ge("age", 25))
      .and(le("age", 28))
      .desc("age")
      .limit(5)
      .all();

    assert.ok(users.length <= 5);
    assert.ok(users.every(u => u.age >= 25 && u.age <= 28));

    // Verify descending order
    for (let i = 1; i < users.length; i++) {
      assert.ok(users[i - 1].age >= users[i].age);
    }
  });
});

describe("Table.has()", () => {
  test("should return true for existing column", () => {
    assert.ok(usersTable.has("name"));
    assert.ok(usersTable.has("age"));
  });

  test("should return true for array of existing columns", () => {
    assert.ok(usersTable.has(["name", "age", "email"]));
  });

  test("should throw for non-existing column", () => {
    assert.throws(() => {
      usersTable.has("nonexistent");
    }, /does not include column/);
  });

  test("should throw for array with non-existing column", () => {
    assert.throws(() => {
      usersTable.has(["name", "nonexistent"]);
    }, /does not include column/);
  });
});

describe("Column Definitions", () => {
  test("int() should create integer column", () => {
    const col = int();
    col.name = "test_int";
    col.tableName = "test_table";
    const sql = col.stringify();
    assert.ok(sql.includes("INTEGER"));
  });

  test("text() should create text column", () => {
    const col = text();
    col.name = "test_text";
    col.tableName = "test_table";
    const sql = col.stringify();
    assert.ok(sql.includes("TEXT"));
  });

  test("should chain all constraints", () => {
    const col = int().primarykey().autoIncrement().notNull().unique();
    col.name = "test_col";
    col.tableName = "test_table";
    const sql = col.stringify();

    assert.ok(sql.includes("PRIMARY KEY"));
    assert.ok(sql.includes("AUTOINCREMENT"));
    assert.ok(sql.includes("NOT NULL"));
    assert.ok(sql.includes("UNIQUE"));
  });

  test("should include default value", () => {
    const col = int().notNull().default(0);
    col.name = "test_default";
    col.tableName = "test_table";
    const sql = col.stringify();

    assert.ok(sql.includes("DEFAULT 0"));
  });
});

describe("DB.from() Error Handling", () => {
  test("should throw for non-existent table", () => {
    assert.throws(() => {
      db.from("nonexistent" as any).select("*").all();
    }, /doesn't exist/);
  });
});

describe("Query.stringify()", () => {
  test("should generate valid SELECT SQL", () => {
    const { sql, params } = db.from("users")
      .select("*")
      .where(eq("age", 30))
      .limit(10)
      .stringify();

    assert.ok(sql.includes("SELECT"));
    assert.ok(sql.includes("FROM"));
    assert.ok(sql.includes("WHERE"));
    assert.ok(sql.includes("LIMIT"));
    assert.deepStrictEqual(params, [30, 10]);
  });

  test("should generate valid INSERT SQL", () => {
    const { sql, params } = db.from("users")
      .insert({ name: "Test", age: 25, email: "test@test.com" })
      .stringify();

    assert.ok(sql.includes("INSERT INTO"));
    assert.ok(sql.includes("VALUES"));
    assert.ok(params.includes("Test"));
    assert.ok(params.includes(25));
  });
});
