export type BNode = {
  id: string;
  keys: number[];
  children: BNode[];
};

export const DEFAULT_MAX_KEYS = 3;
export const MAX_KEYS_OPTIONS = [2, 3, 4, 5, 7] as const;

let counter = 0;
export function makeNode(keys: number[], children: BNode[] = []): BNode {
  counter += 1;
  return { id: `n${counter}`, keys, children };
}

export function isLeaf(n: BNode) {
  return n.children.length === 0;
}

export function cloneTree(n: BNode): BNode {
  return {
    id: n.id,
    keys: [...n.keys],
    children: n.children.map(cloneTree),
  };
}

// Return path from root to node where target is found or would be inserted.
// Each element = {node, childIndex} where childIndex is which child to descend to (undefined if key found here)
export type SearchStep = {
  node: BNode;
  matchIndex?: number;
  childIndex?: number;
};

export function searchPath(root: BNode, target: number): SearchStep[] {
  const steps: SearchStep[] = [];
  let cur: BNode | undefined = root;
  while (cur) {
    let i = 0;
    while (i < cur.keys.length && target > cur.keys[i]) i++;
    if (i < cur.keys.length && cur.keys[i] === target) {
      steps.push({ node: cur, matchIndex: i });
      return steps;
    }
    if (isLeaf(cur)) {
      steps.push({ node: cur });
      return steps;
    }
    steps.push({ node: cur, childIndex: i });
    cur = cur.children[i];
  }
  return steps;
}

// Insert value into tree, returning new root. Splits nodes when they exceed maxKeys.
export function insert(root: BNode, value: number, maxKeys: number): BNode {
  const tree = cloneTree(root);
  if (tree.keys.includes(value)) return tree;
  insertNonFull(tree, value, maxKeys);
  if (tree.keys.length > maxKeys) {
    // split root
    const { leftKeys, rightKeys, midKey, leftChildren, rightChildren } =
      splitKeys(tree);
    const left = makeNode(leftKeys, leftChildren);
    const right = makeNode(rightKeys, rightChildren);
    tree.keys = [midKey];
    tree.children = [left, right];
  }
  return tree;
}

function insertNonFull(node: BNode, value: number, maxKeys: number) {
  if (isLeaf(node)) {
    let i = node.keys.length - 1;
    while (i >= 0 && node.keys[i] > value) i--;
    node.keys.splice(i + 1, 0, value);
    return;
  }
  let i = 0;
  while (i < node.keys.length && value > node.keys[i]) i++;
  const child = node.children[i];
  insertNonFull(child, value, maxKeys);
  if (child.keys.length > maxKeys) {
    // split child
    const { leftKeys, rightKeys, midKey, leftChildren, rightChildren } =
      splitKeys(child);
    child.keys = leftKeys;
    child.children = leftChildren;
    const right = makeNode(rightKeys, rightChildren);
    node.keys.splice(i, 0, midKey);
    node.children.splice(i + 1, 0, right);
  }
}

function splitKeys(n: BNode) {
  const mid = Math.floor(n.keys.length / 2);
  const midKey = n.keys[mid];
  const leftKeys = n.keys.slice(0, mid);
  const rightKeys = n.keys.slice(mid + 1);
  const leftChildren = isLeaf(n) ? [] : n.children.slice(0, mid + 1);
  const rightChildren = isLeaf(n) ? [] : n.children.slice(mid + 1);
  return { leftKeys, rightKeys, midKey, leftChildren, rightChildren };
}

// Fixed set of initial values chosen to produce a 3-level tree at DEFAULT_MAX_KEYS=3.
// With larger maxKeys the resulting tree is shallower but still meaningfully populated.
const INITIAL_VALUES = [
  10, 20, 5, 6, 12, 30, 7, 17, 25, 35, 15, 22, 27, 33, 40, 44, 8, 3, 45, 50,
];

export function buildInitialTree(maxKeys: number = DEFAULT_MAX_KEYS): BNode {
  let t = makeNode([]);
  for (const v of INITIAL_VALUES) {
    t = insert(t, v, maxKeys);
  }
  return t;
}

// Layout: compute { x, y } for each node
export type LayoutNode = {
  id: string;
  x: number;
  y: number;
  width: number;
  keys: number[];
  parentEdges: { from: string; toX: number; toY: number; fromX: number; fromY: number; childIndex: number }[];
};

const NODE_HEIGHT = 40;
const KEY_WIDTH = 40;
const KEY_PADDING = 12;
const LEVEL_GAP = 74;
const SIBLING_GAP = 24;

function nodeWidth(n: BNode) {
  return n.keys.length * KEY_WIDTH + KEY_PADDING * 2;
}

// Simple layout: compute subtree width post-order, position each node centered above its children.
type Positioned = {
  node: BNode;
  x: number;
  y: number;
  width: number;
  subtreeWidth: number;
  childrenPositioned: Positioned[];
};

function measure(n: BNode, depth: number): Positioned {
  const w = nodeWidth(n);
  if (isLeaf(n)) {
    return {
      node: n,
      x: 0,
      y: depth * LEVEL_GAP,
      width: w,
      subtreeWidth: w,
      childrenPositioned: [],
    };
  }
  const kids = n.children.map((c) => measure(c, depth + 1));
  const subtreeWidth = Math.max(
    w,
    kids.reduce((sum, k, i) => sum + k.subtreeWidth + (i > 0 ? SIBLING_GAP : 0), 0)
  );
  return {
    node: n,
    x: 0,
    y: depth * LEVEL_GAP,
    width: w,
    subtreeWidth,
    childrenPositioned: kids,
  };
}

function place(p: Positioned, xOffset: number) {
  p.x = xOffset + (p.subtreeWidth - p.width) / 2;
  let cursor = xOffset;
  for (const child of p.childrenPositioned) {
    place(child, cursor);
    cursor += child.subtreeWidth + SIBLING_GAP;
  }
}

export function layout(root: BNode) {
  const measured = measure(root, 0);
  place(measured, 0);
  const nodes: {
    id: string;
    x: number;
    y: number;
    width: number;
    keys: number[];
  }[] = [];
  const edges: {
    fromId: string;
    toId: string;
    fromX: number;
    fromY: number;
    toX: number;
    toY: number;
    childIndex: number;
  }[] = [];
  const walk = (p: Positioned) => {
    nodes.push({
      id: p.node.id,
      x: p.x,
      y: p.y,
      width: p.width,
      keys: p.node.keys,
    });
    p.childrenPositioned.forEach((c, i) => {
      edges.push({
        fromId: p.node.id,
        toId: c.node.id,
        fromX: p.x + p.width / 2,
        fromY: p.y + NODE_HEIGHT,
        toX: c.x + c.width / 2,
        toY: c.y,
        childIndex: i,
      });
      walk(c);
    });
  };
  walk(measured);
  const totalWidth = measured.subtreeWidth;
  const totalHeight = (getDepth(root) + 1) * LEVEL_GAP;
  return { nodes, edges, width: totalWidth, height: totalHeight };
}

function getDepth(n: BNode): number {
  if (isLeaf(n)) return 0;
  return 1 + Math.max(...n.children.map(getDepth));
}

export const NODE_H = NODE_HEIGHT;
export const KEY_W = KEY_WIDTH;
export const KEY_PAD = KEY_PADDING;
