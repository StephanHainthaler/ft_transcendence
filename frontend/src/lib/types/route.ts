import type { VNode } from "@lib/vdom";

export type Route = () => VNode;
export type LayoutWrapper = (node: VNode) => VNode;
