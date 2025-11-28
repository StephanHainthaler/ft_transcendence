import { Layout } from "@lib/components/layout";
import { type Route } from "@lib/types/route";
import { canvas, div } from "@lib/vdom";

export const Page: Route = () => {
  setTimeout(async () => await import('@lib/game/game'), 1000);
  return Layout(
    div({ class: "w-[60%] h-[60%] flex flex-col" },
      canvas({ id: 'pong-game-canvas', class: 'bg-black' })
    )
  )
}
