import { GameClient } from "@lib/api/gameClient";
import { Layout } from "@lib/components/layout";
import { UserCard } from "@lib/components/ui/UserCard";
import { client } from "@lib/api/index.svelte";
import { type Route } from "@lib/types/route";
import { canvas, div, updateId } from "@lib/vdom";
import type { User } from "@shared/user";

let users: User[] = []
let gameClient: GameClient = new GameClient();

const loadPageData = async () => {
  const data = await client.getFriends();
  users = data.friends;
  updateId(userGrid());
}

loadPageData();

const challengeUser = async (u: User) => {
  const canvas = document.getElementById('pong-game-canvas')!;
  console.log(canvas)
  const challengeUserId = u.id;
  gameClient.canvasElement = canvas as HTMLCanvasElement;
  gameClient.init();
  gameClient.startGame(client.user?.id!, challengeUserId);
}

const userGrid = () => {
  return (
    div({
      id: 'dyn-challenge-user-grid',
      class: 'bg-sage max-h-full p-2 flex flex-col gap-1 opacity-60 rounded-md border-teal border-1 h-full overflow-y-scroll'
    },
      ...(users.map(u => UserCard(u, 'Add', challengeUser))),
    )
  )
}

export const Page: Route = () => {
  return Layout(
    div({ id: 'dyn-game-page-layout', class: 'size-full grid grid-cols-2 justify-center items-center'},
      userGrid(),
      div({ class: "w-[60%] h-[60%] flex flex-col" },
        canvas({ id: 'pong-game-canvas', class: 'bg-black size-full', tabindex: '0' })
      )
    )
  )
}

// export const Page: Route = () => {
//   setTimeout(async () => await import('@lib/game/game'), 1000);
//   return Layout(
//     div({ id: 'dyn-game-page-layout', class: 'size-full flex flex-col justify-center items-center'},
//       div({ class: "w-[60%] h-[60%] flex flex-col" },
//         canvas({ id: 'pong-game-canvas', class: 'bg-black' })
//       )
//     )
//   )
// }
