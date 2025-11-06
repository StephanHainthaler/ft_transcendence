import type { Route } from "@lib/types/route";

async function healthCheckBtnEvent() {
  const healthContent = document.querySelector("#health-check-content");
  try {
    const response = await fetch("/api/health", {
      method: 'GET'
    });
    if (response.ok) {
      const data = await response.json();
      if (healthContent) {
        healthContent.className = `bg-green-500 p-4 text-white`;
        healthContent.innerHTML = `server responded with: ${data.status}`;
      }
    } else {
      throw new Error(`${response.status}`)
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
    const healthBtn = document.querySelector("#health-check-btn");
    if (healthBtn)
      healthBtn.addEventListener('click', healthCheckBtnEvent);
  },
  destroy() {
    const healthBtn = document.querySelector("#health-check-btn");
    if (healthBtn)
      healthBtn.removeEventListener('click', healthCheckBtnEvent);
  },
}

const pageContent = `
  <div class="w-full h-full flex flex-col justify-center items-center">
    <h1 class="mt-4 text-3xl">Health Page</h1>
    <div class="flex gap-4 flex-1 items-center">
      <button id="health-check-btn" class="btn secondary text-secondary">Health Check</button>
      <div id="health-check-content"></div>
    </div>
  </div>
`
