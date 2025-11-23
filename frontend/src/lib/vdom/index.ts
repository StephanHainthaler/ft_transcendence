export type Props = Record<string, any>;
export type Child = VNode | string | undefined;

export * from "./elements"

let oldVNode: VNode | null = null;
let rootElement: Node | null = null;

export type VNode = {
  tag: string,
  props?: Props,
  children: Child[],
}

function updateProps(node: Node, oldProps: Props, newProps: Props) {
  const { set, remove } = diffProps(oldProps, newProps);

  for (const key in remove) {
    if (key.startsWith('on'))
      node.removeEventListener(key.slice(2).toLowerCase(), remove[key]);
    else
      (node as HTMLElement).removeAttribute(key);
  }

  for (const key in set) {
    if (key.startsWith('on')) {
      const eventName = key.slice(2).toLowerCase();
      if (oldProps[key])
        node.removeEventListener(eventName, oldProps[key]);
      node.addEventListener(eventName, set[key]);
    }
    else
      (node as HTMLElement).setAttribute(key, set[key]);
  }
}

function diffProps(oldProps: Props, newProps: Props) {
  const set: Props = {};
  const remove: Props = {};

  for (const key in newProps) {
    if (oldProps[key] !== newProps[key]) {
      set[key] = newProps[key];
    }
  }

  for (const key in oldProps) {
    if (!(key in newProps)) {
      remove[key] = oldProps[key];
    }
  }

  return { set, remove };
}

function cleanupNode(node: Node, vnode: Child) {
  if (typeof vnode === 'string') return;
  for (const key in vnode?.props) {
    if (key.startsWith('on')) {
      const eventName = key.slice(2).toLowerCase();
      node.removeEventListener(eventName, vnode.props[key]);
    }
  }

  vnode?.children.forEach((child, i) => {
    if (node.childNodes[i])
      cleanupNode(node.childNodes[i], child);
  })
}

export function patch(domeNode: Node, oldNode: Child, newNode: Child) {
  try {
    if (!oldNode && !newNode) return;
    if (typeof newNode === 'string') {
      if (oldNode !== newNode) {
        return domeNode.parentNode?.replaceChild(
          document.createTextNode(newNode as string),
          domeNode
        )
      }
      return domeNode
    }

    if (typeof oldNode === 'string') {
      if (typeof newNode === 'object') {
        const node = render(newNode);
        domeNode.parentNode?.replaceChild(node, domeNode);
        return node;
      }
      return domeNode;
    }

    if (oldNode?.tag !== newNode?.tag || newNode?.props?.['replace'] === true) {
      cleanupNode(domeNode, oldNode);
      const node = render(newNode);
      domeNode.parentNode?.replaceChild(node, domeNode);
      return node;
    }

    if (newNode?.props && oldNode?.props)
      updateProps(domeNode, oldNode?.props, newNode.props)
    const oldChildren = oldNode!.children;
    const newChildren = newNode!.children;

    const childNodes = Array.from(domeNode.childNodes);

    for (let i = 0; i < Math.max(newChildren.length, oldChildren.length); i++) {
      if (i >= newChildren.length) {
        cleanupNode(childNodes[i], oldChildren[i]);
        domeNode.removeChild(childNodes[i]);
      } else if (i >= oldChildren.length && newChildren[i]) {
        domeNode.appendChild(render(newChildren[i]));
      } else {
        patch(childNodes[i], oldChildren[i], newChildren[i]);
      }
    }

    return domeNode;
  } catch (e: any) {
    console.error(`Caught exception with input: old: ${JSON.stringify(oldNode)} new: ${JSON.stringify(newNode)}; e: ${e}`);
  }
}

export function mount(node: VNode, container: HTMLElement) {
  if (!node) return ;
  rootElement = render(node) as Node;
  container.appendChild(rootElement);
  oldVNode = node;
}

export function update(newNode: VNode) {
  if (!oldVNode || !rootElement) return;

  patch(rootElement, oldVNode, newNode);

  oldVNode = newNode;
}

const nodeRegistry = new WeakMap<Node, VNode>();

export function updateId(newNode: VNode | (() => VNode)) {
  let vnode;
  if (typeof newNode === 'function')
    vnode = newNode();
  else
    vnode = newNode;
  const id = vnode.props?.id;
  if (id) {
    const node = document.querySelector(`#${id}`);
    if (node) {
      const oldvnode = nodeRegistry.get(node);
      if (oldvnode) {
        patch(node, oldvnode, vnode);
        nodeRegistry.set(node, vnode);
      }
    }
  }
}

export function render(node: Child): HTMLElement | Text {
  if (typeof node === 'string') return document.createTextNode(node);
  const el = document.createElement(node!.tag);
  Object.entries(node!.props || {}).forEach(([k, v]) => {
    if (k.startsWith('on'))
      el.addEventListener(k.slice(2).toLowerCase(), v);
    else
      el.setAttribute(k, v);
  })

  node?.children.forEach((c) => {
    if (c !== undefined && c !== null) {
      el.appendChild(render(c));
    }}
  );
  if (node?.props?.id && (node?.props.id as string).startsWith('dyn'))
    nodeRegistry.set(el, node!);
  return el;
}
