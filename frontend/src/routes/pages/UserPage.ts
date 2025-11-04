import type { Route } from "@lib/types/route";

export const Page: Route = {
  page() {
    return `
      <h1>User Page</h1>
      <button class="btn secondary text-secondary">Test</button>
    `
  },
  setup() {
  },
  destroy() {
  },
}
