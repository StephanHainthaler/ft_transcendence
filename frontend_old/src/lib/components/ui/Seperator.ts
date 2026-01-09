import { div, type Props, type VNode } from "@lib/vdom";

export const Separator = (props?: Props): VNode => {
  let extraClass: '' = '';

  if (props?.class) {
    extraClass = props.class;
    delete props.class;
  }

  return (
    div({ class: `${extraClass} w-full mt-4 border-1 border-neutral-400/50`, ...props})
  )
}
