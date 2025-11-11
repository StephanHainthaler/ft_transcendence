export type Props = Record<string, any>;
export type Child = VNode | string;

export const append = (target: VNode, other: Child) => {
  if (typeof target === 'string') return;
  target.children.push(other);
}

export function p(props?: Props, ...children: Child[]): VNode {
  return { tag: 'p', props, append, children};
}

export function form(props?: Props, ...children: Child[]): VNode {
  return { tag: 'form', props, append, children};
}

export function button(props?: Props, ...children: Child[]): VNode {
  return { tag: 'button', props, append, children};
}

export function a(props?: Props, ...children: Child[]): VNode {
  return { tag: 'a', props, append, children};
}

export function input(props?: Props, ...children: Child[]): VNode {
  return { tag: 'input', props, append, children};
}

export function label(props?: Props, ...children: Child[]): VNode {
  return { tag: 'label', props, append, children};
}

export function div(props?: Props, ...children: Child[]): VNode {
  return { tag: 'div', props, append, children};
}

export function select(props?: Props, ...children: Child[]): VNode {
  return { tag: 'select', props, append, children};
}

let oldVNode: VNode | null = null;
let rootElement: Node | null = null;

export type VNode = {
  tag: string,
  props?: Props,
  children: Child[],
  append: (t: VNode, o: Child) => void,
}

function updateProps(node: Node, oldProps: Props, newProps: Props) {
  const { set, remove } = diffProps(oldProps, newProps);

  for (const key in set) {
    if (key.startsWith('on'))
      node.addEventListener(key.slice(2).toLowerCase(), set[key]);
    else
      (node as HTMLElement).setAttribute(key, set[key]);
  }

  for (const key in remove) {
    if (key.startsWith('on'))
      node.removeEventListener(key.slice(2).toLowerCase(), remove[key]);
    else
      (node as HTMLElement).setAttribute(key, remove[key]);
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

export function patch(domeNode: Node, oldNode: Child, newNode: Child) {
  if (typeof oldNode === 'string' || typeof newNode === 'string') {
    if (oldNode !== newNode) {
      return domeNode.parentNode?.replaceChild(
        document.createTextNode(newNode as string),
        domeNode
      )
    }
    return domeNode
  }

  if (oldNode.tag !== newNode.tag) {
    const node = render(newNode);
    domeNode.parentNode?.replaceChild(node, domeNode);
    return node;
  }

  if (newNode.props && oldNode.props)
    updateProps(domeNode, oldNode.props, newNode.props)
  const oldChildren = oldNode.children;
  const newChildren = newNode.children;

  const childNodes = Array.from(domeNode.childNodes);

  for (let i = 0; i < Math.max(newChildren.length, oldChildren.length); i++) {
    if (i >= newChildren.length) {
      domeNode.removeChild(childNodes[i]);
    } else if (i >= oldChildren.length) {
      domeNode.appendChild(render(newChildren[i]));
    } else {
      patch(childNodes[i], oldChildren[i], newChildren[i]);
    }
  }

  return domeNode;
}

export function mount(node: VNode, container: HTMLElement) {
  rootElement = render(node) as Node;
  console.log(`root element`, rootElement);
  container.appendChild(rootElement);
  oldVNode = node;
}

export function update(newNode: VNode) {
  if (!oldVNode || !rootElement) return;

  patch(rootElement, oldVNode, newNode);

  oldVNode = newNode;
}

export function render(node: Child): HTMLElement | Text {
  if (typeof node === 'string') return document.createTextNode(node);
  const el = document.createElement(node.tag);
  Object.entries(node.props || {}).forEach(([k, v]) => {
    if (k.startsWith('on'))
      el.addEventListener(k.slice(2).toLowerCase(), v);
    else
      el.setAttribute(k, v);
  })

  node.children.forEach((c) => el.appendChild(render(c)));
  return el;
}
