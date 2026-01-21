import { describe, test, beforeEach } from "node:test";
import assert from "node:assert/strict";
import {
  generateRefreshToken,
  hashRefreshToken,
} from "../src/dbHandlers";

describe("Refresh Token Generation", () => {
  test("should generate 64-character hex string", () => {
    const token = generateRefreshToken();

    assert.strictEqual(token.length, 64);
    assert.ok(/^[0-9a-f]+$/.test(token), "Token should be hex string");
  });

  test("should generate unique tokens on each call", () => {
    const token1 = generateRefreshToken();
    const token2 = generateRefreshToken();
    const token3 = generateRefreshToken();

    assert.notStrictEqual(token1, token2);
    assert.notStrictEqual(token2, token3);
    assert.notStrictEqual(token1, token3);
  });

  test("should generate cryptographically random tokens", () => {
    const tokens = new Set<string>();
    for (let i = 0; i < 100; i++) {
      tokens.add(generateRefreshToken());
    }
    // All 100 tokens should be unique
    assert.strictEqual(tokens.size, 100);
  });
});

describe("Refresh Token Hashing", () => {
  test("should hash token to 64-character hex string", () => {
    const token = generateRefreshToken();
    const hash = hashRefreshToken(token);

    assert.strictEqual(hash.length, 64);
    assert.ok(/^[0-9a-f]+$/.test(hash), "Hash should be hex string");
  });

  test("should produce consistent hash for same input", () => {
    const token = "test-token-12345";
    const hash1 = hashRefreshToken(token);
    const hash2 = hashRefreshToken(token);

    assert.strictEqual(hash1, hash2);
  });

  test("should produce different hashes for different inputs", () => {
    const hash1 = hashRefreshToken("token1");
    const hash2 = hashRefreshToken("token2");

    assert.notStrictEqual(hash1, hash2);
  });

  test("should handle empty string input", () => {
    const hash = hashRefreshToken("");
    assert.strictEqual(hash.length, 64);
  });

  test("should handle special characters", () => {
    const hash = hashRefreshToken("token!@#$%^&*()_+-=[]{}|;':\",./<>?");
    assert.strictEqual(hash.length, 64);
    assert.ok(/^[0-9a-f]+$/.test(hash));
  });

  test("should handle very long input", () => {
    const longToken = "a".repeat(10000);
    const hash = hashRefreshToken(longToken);
    assert.strictEqual(hash.length, 64);
  });

  test("should handle unicode characters", () => {
    const hash = hashRefreshToken("token-日本語-emoji-🎉");
    assert.strictEqual(hash.length, 64);
  });
});

describe("Token Hash Security", () => {
  test("hash should not be reversible to original token", () => {
    const token = generateRefreshToken();
    const hash = hashRefreshToken(token);

    // Hash should be completely different from token
    assert.notStrictEqual(token, hash);
    assert.ok(!hash.includes(token.slice(0, 10)));
  });

  test("similar tokens should produce completely different hashes", () => {
    const hash1 = hashRefreshToken("token1");
    const hash2 = hashRefreshToken("token2");

    // Count differing characters - should be many differences
    let differences = 0;
    for (let i = 0; i < hash1.length; i++) {
      if (hash1[i] !== hash2[i]) differences++;
    }

    // Avalanche effect: ~50% of bits should change
    assert.ok(differences > 20, "Hashes should have significant differences");
  });
});
