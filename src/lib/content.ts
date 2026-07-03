import fs from "fs";
import path from "path";
import matter from "gray-matter";

const CONTENT_DIR = path.join(process.cwd(), "content");

export type Project = {
  slug: string;
  title: string;
  subtitle: string;
  tech: string[];
  category: string;
  date: string;
  summary: string;
  body: string;
};

export function getProjects(): Project[] {
  const dir = path.join(CONTENT_DIR, "projects");
  const files = fs.readdirSync(dir).filter((f) => f.endsWith(".md"));

  const projects = files.map((file) => {
    const raw = fs.readFileSync(path.join(dir, file), "utf8");
    const { data, content } = matter(raw);
    return {
      slug: file.replace(/\.md$/, ""),
      title: data.title,
      subtitle: data.subtitle ?? "",
      tech: data.tech ?? [],
      category: data.category ?? "",
      date: data.date ? String(data.date) : "",
      summary: data.summary ?? "",
      body: content.trim(),
    };
  });

  return projects.sort((a, b) => (a.date < b.date ? 1 : -1));
}

export type BanditLevel = {
  slug: string;
  level: number;
  title: string;
  body: string;
};

export function getBanditLevels(): BanditLevel[] {
  const dir = path.join(CONTENT_DIR, "posts", "overthewire", "bandit");
  const files = fs
    .readdirSync(dir)
    .filter((f) => /^bandit\d{2}\.md$/.test(f));

  const levels = files.map((file) => {
    const raw = fs.readFileSync(path.join(dir, file), "utf8");
    const { data, content } = matter(raw);
    const level = parseInt(file.match(/\d+/)![0], 10);
    return {
      slug: file.replace(/\.md$/, ""),
      level,
      title: (data.title as string).replace(/^OverTheWire: Bandit - /, ""),
      body: content.trim(),
    };
  });

  return levels.sort((a, b) => a.level - b.level);
}

export function getBanditLevel(slug: string): BanditLevel | null {
  const filePath = path.join(
    CONTENT_DIR,
    "posts",
    "overthewire",
    "bandit",
    `${slug}.md`
  );
  if (!fs.existsSync(filePath)) return null;

  const raw = fs.readFileSync(filePath, "utf8");
  const { data, content } = matter(raw);
  const level = parseInt(slug.match(/\d+/)![0], 10);
  return {
    slug,
    level,
    title: (data.title as string).replace(/^OverTheWire: Bandit - /, ""),
    body: content.trim(),
  };
}
