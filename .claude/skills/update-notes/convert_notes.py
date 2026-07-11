#!/usr/bin/env python3
"""
Convert the CherryTree pentesting notebook (PenTesting notes.ctb, a SQLite
DB) into src/lib/notes-data.ts.

Usage: python convert_notes.py <path-to-ctb> <path-to-repo-root>

See the header comment this script writes into notes-data.ts, and
.claude/skills/update-notes/SKILL.md, for the full mapping rules.
"""
import sqlite3
import re
import sys
import os
import xml.etree.ElementTree as ET

HEAD = {"h1": 1, "h2": 2, "h3": 3, "h4": 4}
CMD_COLOR = "#4cdd40"


def slugify(title):
    return re.sub(r"[^a-z0-9]+", "-", title.lower()).strip("-")


def escape_ts_string(s):
    return s.replace("\\", "\\\\").replace('"', '\\"')


def escape_template(s):
    s = s.replace("\\", "\\\\")
    s = s.replace("`", "\\`")
    s = s.replace("${", "\\${")
    return s


class Converter:
    def __init__(self, db_path):
        self.db = sqlite3.connect(db_path)
        c = self.db.cursor()
        self.node_txt = {}
        self.node_name = {}
        for nid, name, txt in c.execute("select node_id, name, txt from node"):
            self.node_name[nid] = name
            self.node_txt[nid] = txt or ""
        self.children = {}
        for nid, fid, seq in c.execute(
            "select node_id, father_id, sequence from children"
        ):
            self.children.setdefault(fid, []).append((seq, nid))
        for fid in self.children:
            self.children[fid].sort(key=lambda x: x[0])
        self.grids = {}
        for nid, off, gtxt in c.execute("select node_id, offset, txt from grid"):
            self.grids.setdefault(nid, []).append((off, gtxt))
        self.images = {}
        for nid, off, png in c.execute("select node_id, offset, png from image"):
            self.images.setdefault(nid, []).append((off, png))
        for nid in self.images:
            self.images[nid].sort(key=lambda x: x[0])
        for nid in self.grids:
            self.grids[nid].sort(key=lambda x: x[0])

        # slug + full path per node, via a DFS from the root (father_id 0)
        self.slug = {}
        self.path = {}  # node_id -> list of slugs from root to this node

        def dfs(nid, path_slugs):
            s = slugify(self.node_name[nid])
            self.slug[nid] = s
            self.path[nid] = path_slugs + [s]
            for _, cid in self.children.get(nid, []):
                dfs(cid, self.path[nid])

        for _, nid in self.children.get(0, []):
            dfs(nid, [])

        self.pending_images = []  # (node_id, img_index, png_bytes)

    # ---- inline styling -------------------------------------------------
    def style_run(self, text, attrs):
        if not text:
            return ""
        # A literal "~" is GFM strikethrough syntax (remark-gfm's
        # singleTilde default treats even a lone "~" as a delimiter), so
        # escape it wherever it isn't already protected by a real code span.
        # Skip runs headed for backtick/monospace wrapping below - inside a
        # code span the backslash would show up literally instead of being
        # consumed as an escape.
        if attrs.get("family") != "monospace":
            text = text.replace("~", "\\~")
        out = text
        link = attrs.get("link")
        if link:
            if link.startswith("webs "):
                url = link[len("webs "):]
                out = f"[{out}]({url})"
            elif link.startswith("node "):
                target = int(link.split()[1])
                target_path = self.path.get(target)
                href = "/notes/" + "/".join(target_path) if target_path else "#"
                out = f"[{out}]({href})"
        if attrs.get("family") == "monospace":
            out = f"`{out}`"
        if attrs.get("style") == "italic":
            out = f"*{out}*"
        if attrs.get("weight") == "heavy":
            out = f"**{out}**"
        if attrs.get("foreground") == CMD_COLOR:
            out = f'<span class="cmd">{out}</span>'
        return out

    # ---- table splice -----------------------------------------------------
    def render_table(self, xml_txt):
        root = ET.fromstring(xml_txt)
        rows = []
        for row in root.findall("row"):
            cells = [(cell.text or "").replace("\n", " ").strip().replace("~", "\\~") for cell in row.findall("cell")]
            rows.append(cells)
        if not rows:
            return ""
        header = rows[-1]
        body_rows = rows[:-1]
        ncols = len(header)
        lines = ["| " + " | ".join(header) + " |", "| " + " | ".join(["---"] * ncols) + " |"]
        for r in body_rows:
            lines.append("| " + " | ".join(r) + " |")
        return "  \n".join(lines)

    # ---- per-node body conversion -----------------------------------------
    def convert_body(self, node_id):
        raw_txt = self.node_txt.get(node_id, "")
        try:
            root = ET.fromstring(raw_txt)
        except ET.ParseError:
            return ""
        runs = root.findall("rich_text")

        widgets = []
        for off, gtxt in self.grids.get(node_id, []):
            widgets.append((off, "table", gtxt))
        for idx, (off, png) in enumerate(self.images.get(node_id, []), start=1):
            widgets.append((off, "image", (idx, png)))
        widgets.sort(key=lambda w: w[0])

        tokens = []
        text_buf = []
        heading_level = [None]
        heading_buf = [None]

        def flush_text():
            if text_buf:
                tokens.append(("text", "".join(text_buf)))
                text_buf.clear()

        def flush_heading():
            if heading_buf[0] is not None:
                content = "".join(heading_buf[0]).strip()
                if content:
                    tokens.append(("block", "#" * heading_level[0] + " " + content))
                heading_buf[0] = None
            heading_level[0] = None

        state = {"raw_pos": 0, "widget_count": 0, "wi": 0}

        def emit_widgets_at(buffer_pos):
            while state["wi"] < len(widgets) and widgets[state["wi"]][0] == buffer_pos:
                flush_heading()
                flush_text()
                off, kind, data = widgets[state["wi"]]
                if kind == "table":
                    tokens.append(("block", self.render_table(data)))
                else:
                    img_n, png = data
                    slug = self.slug[node_id]
                    title = self.node_name[node_id]
                    tokens.append(
                        (
                            "block",
                            f"![Screenshot {img_n} in {title} notes](/notes/{slug}/img{img_n}.png)",
                        )
                    )
                    self.pending_images.append((slug, img_n, png))
                state["widget_count"] += 1
                state["wi"] += 1

        emit_widgets_at(state["raw_pos"] + state["widget_count"])

        for rt in runs:
            text = rt.text or ""
            attrs = rt.attrib
            scale = attrs.get("scale")
            parts = text.split("\n")
            for k, part in enumerate(parts):
                if k > 0:
                    state["raw_pos"] += 1
                    if heading_level[0] is not None:
                        flush_heading()
                    else:
                        text_buf.append("\n")
                    emit_widgets_at(state["raw_pos"] + state["widget_count"])
                if k == 0 and scale in HEAD:
                    flush_heading()
                    flush_text()
                    heading_level[0] = HEAD[scale]
                    heading_buf[0] = []
                styled = self.style_run(part, attrs)
                if heading_level[0] is not None:
                    heading_buf[0].append(styled)
                else:
                    text_buf.append(styled)
                state["raw_pos"] += len(part)
                emit_widgets_at(state["raw_pos"] + state["widget_count"])

        flush_heading()
        flush_text()

        # assemble tokens into one markdown string. Block content (tables in
        # particular) may already contain its own internal hard-break
        # newlines ("  \n" between rows) - protect it behind a placeholder
        # so the global single-newline -> hard-break pass below doesn't
        # double up on spacing inside it.
        block_store = {}
        s = ""
        for kind, content in tokens:
            if kind == "block":
                s = s.rstrip(" \t\n")
                if s:
                    s += "\n\n"
                placeholder = f"\x02BLOCK{len(block_store)}\x02"
                block_store[placeholder] = content
                s += placeholder
                s += "\n\n"
            else:
                if s.endswith("\n\n"):
                    content = content.lstrip("\n")
                s += content

        # collapse 2+ newlines to a clean paragraph break, single newlines
        # become markdown hard breaks (trailing two spaces)
        s = re.sub(r"\n{2,}", "\x00PARA\x00", s)
        s = s.replace("\n", "  \n")
        s = s.replace("\x00PARA\x00", "\n\n")
        for placeholder, content in block_store.items():
            s = s.replace(placeholder, content)
        return s.strip()

    # ---- TS emission --------------------------------------------------
    def emit_node(self, node_id, depth, buf):
        item_indent = " " * (2 + 4 * depth)
        key_indent = " " * (4 + 4 * depth)
        name = self.node_name[node_id]
        slug = self.slug[node_id]
        body = self.convert_body(node_id)
        kids = self.children.get(node_id, [])

        buf.append(f"{item_indent}{{\n")
        buf.append(f'{key_indent}slug: "{escape_ts_string(slug)}",\n')
        buf.append(f'{key_indent}title: "{escape_ts_string(name)}",\n')
        if body:
            buf.append(f"{key_indent}body: `{escape_template(body)}`,\n")
        if kids:
            buf.append(f"{key_indent}children: [\n")
            for _, cid in kids:
                self.emit_node(cid, depth + 1, buf)
            buf.append(f"{key_indent}],\n")
        buf.append(f"{item_indent}}},\n")

    def generate_ts(self, header_comment, trailing_block):
        buf = []
        buf.append(header_comment)
        buf.append("\n\n")
        buf.append("export type NoteNode = {\n")
        buf.append("  slug: string;\n")
        buf.append("  title: string;\n")
        buf.append("  body?: string;\n")
        buf.append("  children?: NoteNode[];\n")
        buf.append("};\n\n\n")
        buf.append("export const noteTree: NoteNode[] = [\n")
        for _, nid in self.children.get(0, []):
            self.emit_node(nid, 0, buf)
        buf.append("];\n\n")
        buf.append(trailing_block)
        return "".join(buf)


def main():
    if len(sys.argv) != 3:
        print("usage: convert_notes.py <ctb-path> <repo-root>", file=sys.stderr)
        sys.exit(1)
    ctb_path, repo_root = sys.argv[1], sys.argv[2]

    conv = Converter(ctb_path)

    header_comment = open(
        os.path.join(os.path.dirname(__file__), "notes_header_comment.txt"),
        encoding="utf-8",
    ).read()
    trailing_block = open(
        os.path.join(os.path.dirname(__file__), "notes_trailing_block.txt"),
        encoding="utf-8",
    ).read()

    ts = conv.generate_ts(header_comment, trailing_block)

    out_ts = os.path.join(repo_root, "src", "lib", "notes-data.ts")
    with open(out_ts, "w", encoding="utf-8", newline="\n") as f:
        f.write(ts)

    written_dirs = set()
    for slug, img_n, png in conv.pending_images:
        d = os.path.join(repo_root, "public", "notes", slug)
        os.makedirs(d, exist_ok=True)
        written_dirs.add(d)
        with open(os.path.join(d, f"img{img_n}.png"), "wb") as f:
            f.write(png)

    print(f"Wrote {out_ts}")
    print(f"Wrote {len(conv.pending_images)} images across {len(written_dirs)} node dirs")


if __name__ == "__main__":
    main()
