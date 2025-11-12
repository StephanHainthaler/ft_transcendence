import { type Route } from "@lib/types/route";
import { canvas, div } from "@lib/vdom";

export const Page: Route = () => {
  return (
    div({ class: "size-full flex flex-col" },
      canvas({ id: 'pong-game-canvas' })
    )
  )
}
