import { type Route } from "@lib/types/route";

export const GamePage: Route = {
  page() {
    return `
<div class="size-full flex flex-col">
  <canvas id="pong-game-canvas"></canvas>
</div>
    `
  },
  setup() {
    return `

    `
  },
  destroy() {
    return `

    `
  },
}
