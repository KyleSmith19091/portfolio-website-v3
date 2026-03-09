"use client";

import { codeToHtml } from "shiki";
import React, { useState, useEffect } from "react";
import Magnetic from "./magnetic";

interface CodeBlockProps {
  children: string;
  className?: string;
}

export default function CodeBlock({ children, className }: CodeBlockProps) {
  const [html, setHtml] = useState<string>("");
  const [mounted, setMounted] = useState(false);
  const [copied, setCopied] = useState(false);

  // Only apply syntax highlighting to code blocks (with language class), not inline code
  const isCodeBlock = className?.startsWith("language-");
  const language = className?.replace(/language-/, "") || "plaintext";

  useEffect(() => {
    if (!isCodeBlock) {
      setMounted(true);
      return;
    }

    const code = children.trim();

    codeToHtml(code, {
      lang: language,
      theme: "rose-pine-dawn",
    })
      .then(setHtml)
      .catch(() => {
        setHtml("");
      });

    setMounted(true);
  }, [children, className, isCodeBlock]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(children.trim());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      console.error("Failed to copy");
    }
  };

  // Return plain inline code if no language class
  if (!isCodeBlock) {
    // Strip all backticks from the rendered content
    const cleanedChildren = typeof children === 'string' ? children.replace(/`/g, '') : children;
    return (
      <code
        dangerouslySetInnerHTML={{
          __html: typeof cleanedChildren === 'string' ? cleanedChildren.replace(/`/g, '') : String(cleanedChildren)
        }}
      />
    );
  }

  // For code blocks, we're already inside a <pre> tag from MDX, so just render the content
  if (!mounted || !html) {
    return <code className={className}>{children}</code>;
  }

  return (
    <Magnetic>
      <div style={{ position: "relative" }}>
        <button
          onClick={handleCopy}
          style={{
            position: "absolute",
            top: "0.5rem",
            right: "0.5rem",
            padding: "0.5rem 1rem",
            color: "black",
            border: "2px solid black",
            borderRadius: "0.25rem",
            cursor: "none",
            fontSize: "1em",
            zIndex: 1000,
            pointerEvents: "auto",
          }}
        >
          {copied ? "Copied!" : "Copy"}
        </button>
        <code
          dangerouslySetInnerHTML={{
            __html:
              language === "text"
                ? html.replace(/color:[^;]*/g, "color: black")
                : html,
          }}
          style={{
            display: "contents",
            color: language === "text" ? "black" : undefined,
          }}
        />
      </div>
    </Magnetic>
  );
}
