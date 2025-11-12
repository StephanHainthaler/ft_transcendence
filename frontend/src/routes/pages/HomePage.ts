import { type Route } from "@lib/types/route"
import { div, h1 } from "@lib/vdom"

export const Page: Route = () => {
  return (
    div({ class: 'flex items-center flex-col size-full bg-red-200' },
      h1({  }, 'Home Page')
    )
  )
}
