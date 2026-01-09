import { Layout } from "@lib/components/layout";
import type { Route } from "@lib/types/route";
import { button, div, h1, update } from "@lib/vdom";

let message = '';
let success = false;

async function healthCheckBtnEvent() {
  try {
    const response = await fetch("/api/health", {
      method: 'GET'
    });
    if (response.ok) {
      const data = await response.json();
      message = data.message;
      success = true;
    } else {
      throw new Error(`${response.status}`)
    }
  } catch (e: any) {
    message = e.message || e;
  } finally {
      update(Page());
  }
}

export const Page: Route = () => {
  return Layout(
    div({ class: 'size-full flex flex-col justify-center items-center' },
      h1({ class: 'mt-4 text-3xl' }),
      div({ class: 'flex gap-4 flex-1 items-center' },
        button({ id: 'health-check-btn', class: 'btn secondary text-secondary', onclick: healthCheckBtnEvent }, 'Health Check'),
        div({ id: 'health-check-content', class: `p-4 ${ message.length > 0 ? success ? 'bg-green-300' : 'bg-red-300' : ''}` }, message || '')
      )
    )
  )
}
