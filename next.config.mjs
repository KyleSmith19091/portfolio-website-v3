import createMdx from '@next/mdx';

const nextConfig = {
  pageExtensions: ['js', 'jsx', 'md', 'mdx', 'ts', 'tsx'],
};

const withMDX = createMdx({
  extension: /\.(md|mdx)$/,
  options: {
    remarkPlugins: ['remark-math'],
    rehypePlugins: ['rehype-katex'],
  },
});

export default withMDX(nextConfig);
