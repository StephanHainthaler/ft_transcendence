import { div, h1, type Child } from "@lib/vdom";

export const Alert = ({
  title, show,
}:{
  title: string, show: boolean
}, ...children: Child[]) => {
  return (
    div({
      id: 'dyn-alert',
      class: 'fixed inset-0 z-9999 bg-black/50 backdrop-blur-sm flex items-center justify-center' + (show ? '' : ' hidden'),
    },
      div({
        class: 'card w-96 bg-tan rounded-lg shadow-2xl p-8 flex flex-col items-center gap-6',
      },
        h1({ class: 'text-2xl font-bold text-teal-dark' }, title),
        ...children
      )
    )
  )
}