import type { NextConfig } from "next";
import createMdx from "@next/mdx";
import rehypeKatex from "rehype-katex";
import remarkMath from "remark-math";
import remarkCitation from "./citation";

const nextConfig: NextConfig = {
  /* config options here */
  pageExtensions: ['js', 'jsx', 'md', 'mdx', 'ts', 'tsx'],
};

const withMDX = createMdx({
  extension: /\.(md|mdx)$/,
  options: {
    remarkPlugins: [remarkMath, remarkCitation],
    rehypePlugins: [rehypeKatex] 
  }
})

export default withMDX(nextConfig);
