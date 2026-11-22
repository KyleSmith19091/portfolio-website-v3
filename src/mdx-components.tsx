import type { MDXComponents } from "mdx/types";
import CodeBlock from "./components/code-block";
import MdxLink from "./components/mdx-link";

// Used by @next/mdx for both SSR and client, so the server HTML matches hydration.
export function useMDXComponents(components: MDXComponents): MDXComponents {
  return { code: CodeBlock, a: MdxLink, ...components };
}
