import type { VNode, Props, Child } from "./vdom";

const el = (tag: string, props?: Props, ...children: Child[]) => {
  return { tag, props, children};
}

export const append = (target: VNode, other: Child) => {
  if (typeof target === 'string') return;
  target.children.push(other);
}

export const p = (props?: Props, ...children: Child[]): VNode => {
  return el('p', props, ...children);
}

export const h1 = (props?: Props, ...children: Child[]): VNode => {
  return el('h1', props, ...children);
}

export const h2 = (props?: Props, ...children: Child[]): VNode => {
  return el('h2', props, ...children);
}

export const h3 = (props?: Props, ...children: Child[]): VNode => {
  return el('h3', props, ...children);
}

export const form = (props?: Props, ...children: Child[]): VNode => {
  return el('form', props, ...children);
}

export const button = (props?: Props, ...children: Child[]): VNode => {
  return el('button', props, ...children);
}

export const a = (props?: Props, ...children: Child[]): VNode => {
  return el('a', props, ...children);
}

export const input = (props?: Props, ...children: Child[]): VNode => {
  return el('input', props, ...children);
}

export const label = (props?: Props, ...children: Child[]): VNode => {
  return el('label', props, ...children);
}

export const div = (props?: Props, ...children: Child[]): VNode => {
  return el('div', props, ...children);
}

export const select = (props?: Props, ...children: Child[]): VNode => {
  return el('select', props, ...children);
}

export const canvas = (props?: Props, ...children: Child[]): VNode => {
  return el('canvas', props, ...children);
}

export const svg = (props?: Props, ...children: Child[]): VNode => {
  return el('svg', props, ...children);
}

export const nav = (props?: Props, ...children: Child[]): VNode => {
  return el('nav', props, ...children);
}

export const span = (props?: Props, ...children: Child[]): VNode => {
  return el('span', props, ...children);
}

export const table = (props?: Props, ...children: Child[]): VNode => {
  return el('table', props, ...children);
}

export const thead = (props?: Props, ...children: Child[]): VNode => {
  return el('thead', props, ...children);
}

export const tbody = (props?: Props, ...children: Child[]): VNode => {
  return el('tbody', props, ...children);
}

export const tr = (props?: Props, ...children: Child[]): VNode => {
  return el('tr', props, ...children);
}

export const th = (props?: Props, ...children: Child[]): VNode => {
  return el('th', props, ...children);
}

export const td = (props?: Props, ...children: Child[]): VNode => {
  return el('td', props, ...children);
}
