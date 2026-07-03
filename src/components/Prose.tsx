import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";
import rehypeRaw from "rehype-raw";
import rehypePrettyCode from "rehype-pretty-code";
import rehypeStringify from "rehype-stringify";
import { clsx } from "clsx";
import { rehypeCommandCopy } from "@/lib/rehype-command-copy";

async function renderMarkdown(source: string) {
  const file = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeRaw)
    .use(rehypePrettyCode, { theme: "vitesse-dark", keepBackground: false })
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
