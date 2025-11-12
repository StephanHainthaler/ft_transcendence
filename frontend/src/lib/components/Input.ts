import { div, label as labelEl, input } from "@lib/vdom"

export const Input = (label: string, callback: (e: Event) => void, {
  type
}: {
  type?: string
} = {}) => {
  return (
    div({ class: 'space-y-4' },
      div({},
        labelEl({ class: "label" }, label),
        input({
          type: type || 'text',
          class: 'input',
          oninput: callback,
        }),
      ),
    )
  )
}
