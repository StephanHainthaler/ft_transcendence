import { type Route } from "@lib/types/route"
import { Layout } from "@lib/components/layout"
import { div } from "@lib/vdom"

export const Page: Route = () => {
  return Layout(
    div({ class: 'flex items-center flex-col size-full bg-red-200' },
    )
  )
}
