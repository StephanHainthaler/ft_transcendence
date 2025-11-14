import { Header } from "@lib/components/layout/Header"
import { type LayoutWrapper } from "@lib/types/route"
import { div, type VNode } from "@lib/vdom"

export const Layout: LayoutWrapper = async (node: VNode) => {
  return (
    div({ class: 'flex items-center flex-col size-full' },
      await Header(),
      node,
    )
  )
}
