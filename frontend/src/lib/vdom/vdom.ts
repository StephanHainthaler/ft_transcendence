export type Props = Record<string, any>;
export type Child = VNode | string | undefined;

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

export function patch(domeNode: Node, oldNode: Child, newNode: Child): Node | null | undefined {
  try {
    if (!domeNode) return null;
    if (!oldNode && !newNode) return domeNode;

    if (!newNode && oldNode) {
      cleanupNode(domeNode, oldNode);
      domeNode.parentNode?.removeChild(domeNode);
      return null;
    }

    if (!oldNode && newNode) {
      const node = render(newNode);
      domeNode.parentNode?.replaceChild(node, domeNode);
      return node;
    }

    if (typeof oldNode === 'string' && typeof newNode === 'string') {
      domeNode.textContent = newNode;
      return domeNode;
    }

    if (typeof oldNode === 'string' && typeof newNode !== 'string') {
      const node = render(newNode);
      domeNode.parentNode?.replaceChild(node, domeNode);
      return node;
    }

    if (typeof newNode === 'string') {
      cleanupNode(domeNode, oldNode);
      const textNode = document.createTextNode(newNode);
      domeNode.parentNode?.replaceChild(textNode, domeNode);
      return textNode;
    }

    const oldEl = oldNode as VNode;
    const newEl = newNode as VNode;

    if (oldEl.tag !== newEl.tag || newEl.props?.['replace'] === true) {
      cleanupNode(domeNode, oldEl);
      const node = render(newEl);
      domeNode.parentNode?.replaceChild(node, domeNode);
      return node;
    }

    if (newEl.props || oldEl.props) {
      updateProps(domeNode, oldEl.props || {}, newEl.props || {});
    }

    const oldChildren = oldEl.children || [];
    const newChildren = newEl.children || [];
    const childNodes = Array.from(domeNode.childNodes);
    const maxLen = Math.max(oldChildren.length, newChildren.length);

    for (let i = 0; i < maxLen; i++) {
      const oldChild = oldChildren[i];
      const newChild = newChildren[i];
      const domChild = childNodes[i];

      if (!newChild && oldChild && domChild) {
        cleanupNode(domChild, oldChild);
        domeNode.removeChild(domChild);
      } else if (newChild && !oldChild) {
        const newDomChild = render(newChild);
        if (i < childNodes.length) {
          domeNode.insertBefore(newDomChild, childNodes[i]);
        } else {
          domeNode.appendChild(newDomChild);
        }
      } else if (newChild && oldChild && domChild) {
        patch(domChild, oldChild, newChild);
      } else if (newChild && !domChild) {
        domeNode.appendChild(render(newChild));
      }
    }

    return domeNode;
  } catch (e: any) {
    console.error(
      `Patch error - Old: ${JSON.stringify(oldNode)}, New: ${JSON.stringify(newNode)}, Error: ${e.message}`,
      e
    );
    return domeNode;
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

export function updateId(...newNodes: (VNode | (() => VNode))[]) {
  let vnode;
  let node;
  for (const newNode of newNodes) {
    if (typeof newNode === 'function')
      vnode = newNode();
    else
      vnode = newNode;
    const id = vnode.props?.id;
    if (id) {
      node = document.querySelector(`#${id}`);
      if (node) {
        const oldvnode = nodeRegistry.get(node);
        if (oldvnode) {
          patch(node, oldvnode, vnode);
          nodeRegistry.set(node, vnode);
        }
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
  if (node?.props?.id && (node?.props.id as string).startsWith('dyn-'))
    nodeRegistry.set(el, node!);
  return el;
}
