export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  date: Date;
  author: string;
  ogImage?: string;
  keywords?: string[];
}

export const blogPosts: BlogPost[] = [
  {
    slug: "induction",
    title: "Induction Circuits",
    description:
      "Ever wonder how LLMs discover context? Well they use induction.",
    date: new Date("2025-03-01"),
    author: "Kyle Smith",
    ogImage: "/blog/induction/gpt2.png",
    keywords: [
      "induction",
      "circuits",
      "transformers",
      "attention",
      "GPT-2",
      "LLM",
      "machine learning",
    ],
  },
  {
    slug: "lsm-db/day1",
    title: "LSM DB Build Day 1",
    description:
      "Journal for building a Log-Structured-Merge Tree Storage Engine in Rust",
    date: new Date("2026-02-01"),
    author: "Kyle Smith",
    ogImage: "/blog/lsm-db/day1.png",
    keywords: ["lsm", "db", "database"],
  },
  {
    slug: "lsm-db/day2",
    title: "LSM DB Build Day 2",
    description:
      "Journal for building a Log-Structured-Merge Tree Storage Engine in Rust",
    date: new Date("2026-02-05"),
    author: "Kyle Smith",
    ogImage: "/blog/lsm-db/day1.png",
    keywords: ["lsm", "db", "database"],
  },
  {
    slug: "fs",
    title: "Distributed Filesystem",
    description:
      "Ideas behind distributed filesystems",
    date: new Date("2026-02-05"),
    author: "Kyle Smith",
    ogImage: "/blog/lsm-db/day1.png",
    keywords: ["files", "filesystem", "gfs"],
  },
];

export function getBlogPost(slug: string): BlogPost | undefined {
  return blogPosts.find((post) => post.slug === slug);
}

export function getAllBlogPosts(): BlogPost[] {
  return blogPosts.sort((a, b) => b.date.getTime() - a.date.getTime());
}
