import { visit } from 'unist-util-visit';

export default function remarkCitation() {
  return (tree: any) => {
    visit(tree, 'text', (node) => {
      // matches citations like [@smith2020]
      const citationRegex = /\[@([\w-]+)\]/g;

      // find matches in current node
      const matches = [...node.value.matchAll(citationRegex)];

      // nothing found -> move on
      if (matches.length === 0) return;

      const newChildren = [];
      let lastIndex = 0;

      matches.forEach(match => {
        const [raw, key] = match;
        const start = match.index;
        const end = start + raw.length;

        if (start > lastIndex) {
          newChildren.push({ type: 'text', value: node.value.slice(lastIndex, start) });
        }

        newChildren.push({
          type: 'link',
          url: `#cite-${key}`,
          children: [{ type: 'text', value: `[${key}]` }]
        });

        lastIndex = end;
      });

      if (lastIndex < node.value.length) {
        newChildren.push({ type: 'text', value: node.value.slice(lastIndex) });
      }

      node.type = 'span';
      node.children = newChildren;
    });
  };
}
