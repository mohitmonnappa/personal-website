import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";
import rehypeRaw from "rehype-raw";
import rehypePrettyCode from "rehype-pretty-code";
import rehypeStringify from "rehype-stringify";
import { clsx } from "clsx";
import { rehypeCommandCopy } from "@/lib/rehype-command-copy";

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

function isBanditChallengeHref(href: unknown): href is string {
  return (
    typeof href === "string" &&
    /^https:\/\/overthewire\.org\/wargames\/bandit\/bandit\d+\.html$/.test(
      href
    )
  );
}

function rehypeBanditChallengeLinks() {
  return (tree: HastNode) => {
    const visit = (node: HastNode) => {
      if (isElement(node, "a") && node.properties) {
        if (isBanditChallengeHref(node.properties.href)) {
          node.properties.target = "_blank";
          node.properties.rel = "noreferrer noopener";
        }
      }

      node.children?.forEach(visit);
    };

    visit(tree);
  };
}

async function renderMarkdown(source: string) {
  const file = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeRaw)
    .use(rehypePrettyCode, { theme: "vitesse-dark", keepBackground: false })
    .use(rehypeBanditChallengeLinks)
    .use(rehypeCommandCopy)
    .use(rehypeStringify)
    .process(source);

  return String(file);
}

export async function Prose({
  source,
  className,
}: {
  source: string;
  className?: string;
}) {
  const html = await renderMarkdown(source);

  return (
    <div
      className={clsx("prose-article", className)}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
