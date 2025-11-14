import { div, label as labelEl, input, type Props } from "@lib/vdom"

export const Input = (label: string, callback?: (e: Event) => void, props?: Props) => {
  return (
    div({ class: 'space-y-4' },
      div({},
        labelEl({ class: "label" }, label),
        input({
          class: 'input',
          oninput: callback,
          onchange: callback,
          ...props,
        }),
      ),
    )
  )
}
