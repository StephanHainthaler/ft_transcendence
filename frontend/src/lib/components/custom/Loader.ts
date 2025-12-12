import { div, h3 } from "@lib/vdom"

export const Loader = () => {
  return (
    div({ class: 'z-1000 top-0 left-0 h-screen w-screen bg-black/80 flex flex-col gap-4 items-center justify-center' },
      div({ class: 'animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-white' }),
      h3({ class: 'text-center text-neutral-200 text-lg' }, 'Loading...')
    )
  )
}
