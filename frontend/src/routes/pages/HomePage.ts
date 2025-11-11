import { type Route } from "@lib/types/route"
import { div } from "@lib/vdom"

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
  node() {
    const ret = div({ class: "h-[50px] w-[100px] bg-green-300", id: 'bless' }, 'hello')
    console.log(`ret after node() ${JSON.stringify(ret)}`);
    return ret
  },
}
