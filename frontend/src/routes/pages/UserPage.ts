import type { Route } from "@lib/types/route";
import { userClient } from "@lib/user/userClient";

async function getUserBtnEvent() {
  const healthContent = document.querySelector("#user-content");
  try {
    const data = await userClient.getUser();
    if (healthContent) {
      healthContent.className = `bg-green-500 p-4 text-white`;
      healthContent.innerHTML = `server responded with: ${JSON.stringify(data)}`;
    }
  } catch (e: any) {
    if (healthContent) {
      healthContent.className = "bg-red-500 p-4 text-white";
      healthContent.innerHTML = `Failed to fetch health: ${e.message || e.code || e}`;
    }
  }
}

export const Page: Route = {
  page() {
    return pageContent;
  },
  setup() {
    const healthBtn = document.querySelector("#get-user-btn");
    if (healthBtn)
      healthBtn.addEventListener('click', getUserBtnEvent);
  },
  destroy() {
    const healthBtn = document.querySelector("#get-user-btn");
    if (healthBtn)
      healthBtn.removeEventListener('click', getUserBtnEvent);
  },
}

const pageContent = `
  <div class="w-full h-full flex flex-col justify-center items-center">
    <h1 class="mt-4 text-3xl">User Page</h1>
    <div class="flex gap-4 flex-1 items-center">
      <button id="get-user-btn" class="btn secondary text-secondary">Get User</button>
      <div id="user-content"></div>
    </div>
  </div>
`
