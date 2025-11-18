import { Header } from "@lib/components/layout/Header"
import { type LayoutWrapper } from "@lib/types/route"
import { div, type VNode } from "@lib/vdom"

export const Layout: LayoutWrapper = (node: VNode) => {
  return (
    div({ class: 'flex items-center flex-col size-full' },
      Header(),
      node,
    )
  )
}
