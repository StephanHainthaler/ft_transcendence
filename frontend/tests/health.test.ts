import { test } from "node:test";
import assert from "node:assert";

const API_URL = process.env.VITE_API_URL;

test("backend health", async () => {
  const response = await fetch(`${API_URL}/health`, {
    method: "GET",
  });
  if (response.ok) {
    const healthData = await response.json();
    assert.strictEqual(healthData.status, "healthy");
  } else {
    throw new Error("Health response not okay");
  }
});
