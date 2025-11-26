import { div, h1, type VNode } from "@lib/vdom";

const E404 =
div({ class: 'w-full' }, h1({ class: 'text-lg' }, '404 not found'));
export const ErrorPage = (kind: '404' | '500' | '401'): VNode => {
  switch (kind) {
    case "500":
    case "401":
    default:
    case "404":
      return E404;
  }
}