// Adds a copy button to command lines inside shell code blocks - lines
// that start with "$ " - so only the command gets copied, never the
// output printed below it. Runs after rehype-pretty-code, which is what
// wraps each source line in <span data-line>.

type HastNode = {
  type: string;
  tagName?: string;
  properties?: Record<string, unknown>;
  children?: HastNode[];
  value?: string;
};

function isElement(node: HastNode, tag?: string): boolean {
  return node.type === "element" && (!tag || node.tagName === tag);
}

function isDataLineSpan(node: HastNode): boolean {
  if (!isElement(node, "span") || !node.properties) return false;
  return "data-line" in node.properties || "dataLine" in node.properties;
}

function textOf(node: HastNode): string {
  if (node.type === "text") return node.value ?? "";
  if (node.children) return node.children.map(textOf).join("");
  return "";
}

function endsWithContinuation(text: string): boolean {
  return /\\\s*$/.test(text);
}

function icon(path: HastNode[], extraClass: string): HastNode {
  return {
    type: "element",
    tagName: "svg",
    properties: {
      className: [extraClass],
      viewBox: "0 0 24 24",
      width: "13",
      height: "13",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "2",
      strokeLinecap: "round",
      strokeLinejoin: "round",
    },
    children: path,
  };
}

function copyButton(command: string): HastNode {
  return {
    type: "element",
    tagName: "button",
    properties: {
      type: "button",
      className: [
        "code-copy-btn",
        "inline-flex",
        "items-center",
        "justify-center",
        "ml-2",
        "p-0.5",
        "rounded",
        "border-0",
        "bg-transparent",
        "cursor-pointer",
        "text-stone",
        "hover:text-pine",
        "transition-colors",
        "opacity-0",
        "group-hover:opacity-100",
        "focus-visible:opacity-100",
      ],
      "data-copy": command,
      "aria-label": "Copy command",
    },
    children: [
      icon(
        [
          {
            type: "element",
            tagName: "rect",
            properties: { x: "9", y: "9", width: "13", height: "13", rx: "2" },
            children: [],
          },
          {
            type: "element",
            tagName: "path",
            properties: {
              d: "M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1",
            },
            children: [],
          },
        ],
        "copy-icon"
      ),
      icon(
        [
          {
            type: "element",
            tagName: "path",
            properties: { d: "M20 6 9 17l-5-5" },
            children: [],
          },
        ],
        "check-icon"
      ),
    ],
  };
}

function addLineButton(lineSpan: HastNode, command: string) {
  const props = lineSpan.properties ?? (lineSpan.properties = {});
  const existingClass = Array.isArray(props.className)
    ? (props.className as string[])
    : [];
  props.className = [...existingClass, "group", "code-line--command"];
  lineSpan.children = [...(lineSpan.children ?? []), copyButton(command)];
}

function processCodeBlock(codeEl: HastNode) {
  const lineSpans = (codeEl.children ?? []).filter(isDataLineSpan);

  let i = 0;
  while (i < lineSpans.length) {
    const firstText = textOf(lineSpans[i]);
    const match = /^\$\s(.*)$/.exec(firstText);
    if (!match) {
      i++;
      continue;
    }

    const parts = [match[1]];
    let cursor = i;
    let lastText = firstText;
    while (endsWithContinuation(lastText) && cursor + 1 < lineSpans.length) {
      cursor++;
      lastText = textOf(lineSpans[cursor]);
      parts.push(lastText);
    }

    addLineButton(lineSpans[i], parts.join("\n"));
    i = cursor + 1;
  }
}

function visit(node: HastNode) {
  if (isElement(node, "pre") && node.children) {
    const codeEl = node.children.find((c) => isElement(c, "code"));
    if (codeEl) processCodeBlock(codeEl);
  }
  node.children?.forEach(visit);
}

export function rehypeCommandCopy() {
  return (tree: HastNode) => {
    visit(tree);
  };
}
