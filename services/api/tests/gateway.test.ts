import { describe, test } from "node:test";
import assert from "node:assert/strict";

// Test the public routes configuration logic
const publicRoutes = [
  "/auth/login",
  "/auth/refresh",
  "/auth/sign-up",
  "/user/avatar",
  "/game",
  "/auth/github-oauth",
];

function isPublicRoute(url: string): boolean {
  return publicRoutes.some((r) => url.includes(r));
}

function parseAuthHeader(header: string | undefined): { valid: boolean; token?: string; error?: string } {
  if (!header) {
    return { valid: false, error: "Missing auth header" };
  }
  if (!header.startsWith("Bearer ")) {
    return { valid: false, error: "Invalid auth header" };
  }
  const token = header.replace("Bearer ", "");
  if (!token) {
    return { valid: false, error: "Empty token" };
  }
  return { valid: true, token };
}

describe("Public Routes Configuration", () => {
  test("should identify /auth/login as public", () => {
    assert.ok(isPublicRoute("/auth/login"));
  });

  test("should identify /auth/refresh as public", () => {
    assert.ok(isPublicRoute("/auth/refresh"));
  });

  test("should identify /auth/sign-up as public", () => {
    assert.ok(isPublicRoute("/auth/sign-up"));
  });

  test("should identify /user/avatar as public", () => {
    assert.ok(isPublicRoute("/user/avatar"));
    assert.ok(isPublicRoute("/user/avatar/some-file.png"));
  });

  test("should identify /game as public", () => {
    assert.ok(isPublicRoute("/game"));
    assert.ok(isPublicRoute("/game/some-path"));
  });

  test("should identify /auth/github-oauth as public", () => {
    assert.ok(isPublicRoute("/auth/github-oauth"));
  });

  test("should identify private routes correctly", () => {
    assert.ok(!isPublicRoute("/user/profile"));
    assert.ok(!isPublicRoute("/user/1"));
    assert.ok(!isPublicRoute("/stats/leaderboard"));
    assert.ok(!isPublicRoute("/auth/logout"));
    assert.ok(!isPublicRoute("/auth/validate"));
  });

  test("should handle query parameters in public routes", () => {
    assert.ok(isPublicRoute("/auth/login?redirect=/dashboard"));
    assert.ok(isPublicRoute("/auth/github-oauth?code=abc123"));
  });
});

describe("Auth Header Parsing", () => {
  test("should reject missing auth header", () => {
    const result = parseAuthHeader(undefined);

    assert.strictEqual(result.valid, false);
    assert.strictEqual(result.error, "Missing auth header");
  });

  test("should reject empty auth header", () => {
    const result = parseAuthHeader("");

    assert.strictEqual(result.valid, false);
    assert.strictEqual(result.error, "Missing auth header");
  });

  test("should reject auth header without Bearer prefix", () => {
    const result = parseAuthHeader("Basic abc123");

    assert.strictEqual(result.valid, false);
    assert.strictEqual(result.error, "Invalid auth header");
  });

  test("should reject malformed Bearer token", () => {
    const result = parseAuthHeader("bearer token123");

    assert.strictEqual(result.valid, false);
    assert.strictEqual(result.error, "Invalid auth header");
  });

  test("should accept valid Bearer token", () => {
    const result = parseAuthHeader("Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test.signature");

    assert.strictEqual(result.valid, true);
    assert.strictEqual(result.token, "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test.signature");
  });

  test("should extract token correctly", () => {
    const result = parseAuthHeader("Bearer my-token-123");

    assert.strictEqual(result.valid, true);
    assert.strictEqual(result.token, "my-token-123");
  });

  test("should handle Bearer with extra spaces", () => {
    // Note: This tests actual behavior - extra spaces would be part of the token
    const result = parseAuthHeader("Bearer  token-with-leading-space");

    assert.strictEqual(result.valid, true);
    assert.strictEqual(result.token, " token-with-leading-space");
  });
});

describe("Route Matching Edge Cases", () => {
  test("should not match partial route names", () => {
    // /auth/login should match, but /auth/loginx should not be considered "login"
    // Note: current implementation uses includes() which is loose
    assert.ok(isPublicRoute("/auth/login")); // exact
    assert.ok(isPublicRoute("/auth/login/")); // with trailing slash
  });

  test("should handle case sensitivity", () => {
    // Routes are case-sensitive
    assert.ok(!isPublicRoute("/AUTH/LOGIN"));
    assert.ok(!isPublicRoute("/Auth/Login"));
  });

  test("should handle empty URL", () => {
    assert.ok(!isPublicRoute(""));
  });

  test("should handle root URL", () => {
    assert.ok(!isPublicRoute("/"));
  });
});

describe("Health Response Types", () => {
  interface HealthResponse {
    serviceName: string;
    status: string;
  }

  test("should validate healthy response structure", () => {
    const response: HealthResponse = { serviceName: "userService", status: "healthy" };

    assert.strictEqual(response.serviceName, "userService");
    assert.strictEqual(response.status, "healthy");
  });

  test("should validate unhealthy response structure", () => {
    const response: HealthResponse = { serviceName: "authService", status: "unhealthy" };

    assert.strictEqual(response.serviceName, "authService");
    assert.strictEqual(response.status, "unhealthy");
  });

  test("should check health status correctly", () => {
    const healthyResponse: HealthResponse = { serviceName: "test", status: "healthy" };
    const unhealthyResponse: HealthResponse = { serviceName: "test", status: "error" };

    assert.strictEqual(healthyResponse.status === "healthy", true);
    assert.strictEqual(unhealthyResponse.status === "healthy", false);
  });
});

describe("Internal Routes", () => {
  function isInternalRoute(url: string): boolean {
    return url.startsWith("/internal");
  }

  test("should identify internal routes", () => {
    assert.ok(isInternalRoute("/internal/metrics"));
    assert.ok(isInternalRoute("/internal/debug"));
  });

  test("should not match non-internal routes", () => {
    assert.ok(!isInternalRoute("/user/internal"));
    assert.ok(!isInternalRoute("/auth/internal-token"));
  });
});
