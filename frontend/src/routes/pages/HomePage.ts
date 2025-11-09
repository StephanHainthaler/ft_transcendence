import { type Route } from "@lib/types/route"

export const Page: Route = {
  page() {
    return `
      <div class="flex items-center flex-col h-full w-full bg-red-200">
        <h1>Home Page</h1>
      </div>
    `
  },
  setup() {
  },
  destroy() {
  },
}
