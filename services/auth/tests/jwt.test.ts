import { describe, test } from "node:test";
import assert from "node:assert/strict";
import { generateJWT, validateJWT } from "../src/jwt";
import { JWT } from "../../../shared/api";

const TEST_SECRET = "test-secret-key-for-jwt-testing";

describe("JWT Generation", () => {
  test("should generate valid JWT for user with id", () => {
    const user = { id: 1, name: "testuser" };
    const jwt = generateJWT(user, TEST_SECRET);

    assert.ok(jwt.raw);
    assert.ok(jwt.header);
    assert.ok(jwt.payload);
    assert.ok(jwt.sig);
    assert.strictEqual(jwt.header.alg, "HS256");
    assert.strictEqual(jwt.header.typ, "JWT");
  });

  test("should include correct payload fields", () => {
    const user = { id: 42, name: "alice" };
    const jwt = generateJWT(user, TEST_SECRET);

    assert.strictEqual(jwt.payload.sub, 42);
    assert.ok(jwt.payload.iat > 0);
    assert.ok(jwt.payload.exp > 0);
  });

  test("should throw error when user id is missing", () => {
    const user = { name: "noIdUser" };
    assert.throws(() => {
      generateJWT(user as any, TEST_SECRET);
    }, /Missing user id/);
  });

  test("should throw error for empty user object", () => {
    assert.throws(() => {
      generateJWT({} as any, TEST_SECRET);
    }, /Missing user id/);
  });

  test("should generate different signatures for different secrets", () => {
    const user = { id: 1 };
    const jwt1 = generateJWT(user, "secret1");
    const jwt2 = generateJWT(user, "secret2");

    assert.notStrictEqual(jwt1.sig, jwt2.sig);
  });

  test("should generate JWT with three parts separated by dots", () => {
    const user = { id: 1 };
    const jwt = generateJWT(user, TEST_SECRET);
    const parts = jwt.raw.split(".");

    assert.strictEqual(parts.length, 3);
  });
});

describe("JWT Validation", () => {
  test("should validate a correctly generated JWT", () => {
    const user = { id: 1 };
    const jwt = generateJWT(user, TEST_SECRET);

    assert.doesNotThrow(() => {
      validateJWT(jwt, TEST_SECRET);
    });
  });

  test("should reject JWT with wrong secret", () => {
    const user = { id: 1 };
    const jwt = generateJWT(user, TEST_SECRET);

    assert.throws(() => {
      validateJWT(jwt, "wrong-secret");
    }, /Invalid token signature/);
  });

  test("should reject JWT with tampered payload", () => {
    const user = { id: 1 };
    const jwt = generateJWT(user, TEST_SECRET);

    // Tamper with the payload
    const parts = jwt.raw.split(".");
    const tamperedPayload = btoa(JSON.stringify({ sub: 999, iat: Date.now(), exp: 300000 }));
    const tamperedJwt: JWT = {
      ...jwt,
      raw: `${parts[0]}.${tamperedPayload}.${parts[2]}`,
    };

    assert.throws(() => {
      validateJWT(tamperedJwt, TEST_SECRET);
    }, /Invalid token signature/);
  });

  test("should reject expired JWT", () => {
    const user = { id: 1 };
    const jwt = generateJWT(user, TEST_SECRET);

    // Simulate an expired token by manipulating the payload
    const expiredJwt: JWT = {
      ...jwt,
      payload: {
        ...jwt.payload,
        iat: Date.now() - 1000 * 60 * 60, // 1 hour ago
        exp: 1000, // Very short expiration
      },
    };

    assert.throws(() => {
      validateJWT(expiredJwt, TEST_SECRET);
    }, /Token expired/);
  });
});

describe("JWT Edge Cases", () => {
  test("should handle user id of 0", () => {
    const user = { id: 0 };
    // id of 0 is falsy, should throw
    assert.throws(() => {
      generateJWT(user, TEST_SECRET);
    }, /Missing user id/);
  });

  test("should handle negative user id", () => {
    const user = { id: -1 };
    const jwt = generateJWT(user, TEST_SECRET);

    assert.strictEqual(jwt.payload.sub, -1);
  });

  test("should handle very large user id", () => {
    const user = { id: Number.MAX_SAFE_INTEGER };
    const jwt = generateJWT(user, TEST_SECRET);

    assert.strictEqual(jwt.payload.sub, Number.MAX_SAFE_INTEGER);
  });

  test("should handle empty secret string", () => {
    const user = { id: 1 };
    // Should still work, though not secure
    const jwt = generateJWT(user, "");
    assert.ok(jwt.raw);
  });
});
