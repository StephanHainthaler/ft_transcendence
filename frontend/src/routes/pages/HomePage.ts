import { type Route } from "@lib/types/route"

export const Page: Route = {
  page() {
    return `
      <div class="h-screen w-screen bg-red-200">
        <a id="user-page-anchor" href="/user">User</a>
      </div>
    `
  },
  setup() {
  },
  destroy() {
  },
}
