import { div, type VNode } from "@lib/vdom"

export const error = (...content: VNode[]): VNode => {
  return (
    div({
      id: 'dyn-not-logged-in-container',
      class: 'fixed inset-0 z-9999 bg-black/50 backdrop-blur-sm flex items-center justify-center',
    },
      div({
        class: 'card w-96 bg-tan rounded-lg shadow-2xl p-8 flex flex-col items-center gap-6',
      },
        ...content
      )
    )
  )
}
