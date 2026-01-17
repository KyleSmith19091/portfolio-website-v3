'use client';

import { useEffect, useRef } from 'react';
import katex from 'katex';

interface MathProps {
  children: string;
  display?: boolean;
}

export default function Math({ children, display = false }: MathProps) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (ref.current) {
      try {
        katex.render(children, ref.current, {
          displayMode: display,
          throwOnError: false,
        });
      } catch (error) {
        console.error('KaTeX rendering error:', error);
      }
    }
  }, [children, display]);

  return <span ref={ref} style={{ display: display ? 'block' : 'inline-block' }} />;
}
