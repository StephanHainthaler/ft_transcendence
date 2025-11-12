import type { Route } from "@lib/types/route";
import { userClient } from "@lib/user/userClient";
import { button, div, h1, update } from "@lib/vdom";

let message: string = '';
let success: boolean = false;

async function getUserBtnEvent() {
  try {
    const data = await userClient.getUser();
    message = JSON.stringify(data);
    success = true;
  } catch (e: any) {
    console.log(e)
    message = e.message || e
  } finally {
    update(Page());
  }
}

export const Page: Route = () => {
  return (
    div({ class: 'w-full h-full flex flex-col justify-center items-center' },
      h1({ class: 'mt-4 text-3xl' }, 'User Page'),
      div({ class: 'flex gap-4 flex-1 items-center' },
        button({ class: 'btn secondary text-secondary', onclick: getUserBtnEvent }, 'Get User'),
        div({ class: `p-4 ${message.length > 0 ? success ? 'bg-green-500' : 'bg-red-500' : ''}` }, message)
      )
    )
  )
}
