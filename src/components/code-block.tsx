"use client";

import { codeToHtml } from "shiki";
import React, { useState, useEffect, useMemo, useRef } from "react";
import Magnetic from "./magnetic";

interface CodeBlockProps {
  children: string;
  className?: string;
}

const SHELL_LANGS = new Set(["bash", "sh", "shell", "zsh", "console", "shellscript"]);
const PLAIN_LANGS = new Set(["text", "plaintext", "txt"]);

const ICON_PROPS = {
  width: 16,
  height: 16,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

const CopyIcon = () => (
  <svg {...ICON_PROPS}>
    <rect x="9" y="9" width="13" height="13" rx="2" />
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
  </svg>
);

const CheckIcon = () => (
  <svg {...ICON_PROPS}>
    <path d="M20 6 9 17l-5-5" />
  </svg>
);

export default function CodeBlock({ children, className }: CodeBlockProps) {
  const [html, setHtml] = useState<string>("");
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const raw = typeof children === "string" ? children : "";
  const code = raw.replace(/\n+$/, "");
  const isMultiline = code.includes("\n");

  // MDX gives inline code no className and no newline. A fenced block without a
  // language has no className but does contain a newline (or trailing "\n").
  const isFenced = Boolean(className?.startsWith("language-")) || raw.endsWith("\n") || isMultiline;
  const language = className?.replace(/language-/, "") || "text";
  const isShell = SHELL_LANGS.has(language);
  const isPlain = PLAIN_LANGS.has(language);

  // Shell one-liners: drop a pasted "$ " prompt so it is never copied.
  const copyText = useMemo(
    () => (isShell && !isMultiline ? code.replace(/^\s*[$>]\s+/, "") : code),
    [code, isShell, isMultiline]
  );

  useEffect(() => {
    if (!isFenced || isPlain) return;
    let cancelled = false;

    codeToHtml(copyText, { lang: language, theme: "rose-pine-dawn" })
      .then((out) => !cancelled && setHtml(out))
      .catch(() => !cancelled && setHtml(""));

    return () => {
      cancelled = true;
    };
  }, [copyText, language, isFenced, isPlain]);

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(copyText);
      setCopied(true);
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => setCopied(false), 1800);
    } catch {
      console.error("Failed to copy");
    }
  };

  // Inline code: render as text (no innerHTML) and strip stray backticks.
  if (!isFenced) {
    return <code>{typeof children === "string" ? children.replace(/`/g, "") : children}</code>;
  }

  const highlighted = (
    <code
      dangerouslySetInnerHTML={{ __html: html }}
      style={{ display: "contents" }}
    />
  );
  const fallback = (
    <code className={className} style={{ whiteSpace: isMultiline ? "pre" : "nowrap", color: "black" }}>
      {copyText}
    </code>
  );
  const body = html && !isPlain ? highlighted : fallback;

  const buttonBase: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    gap: "0.4rem",
    color: "black",
    background: copied ? "#9ccfd8" : "white",
    border: "2px solid black",
    borderRadius: "0.25rem",
    cursor: "none",
    fontSize: "0.8em",
    lineHeight: 1,
    transition: "background 150ms ease, transform 150ms ease",
    pointerEvents: "auto",
  };

  // ── One-liner: a compact "command bar" ───────────────────────────────────
  if (!isMultiline) {
    return (
      <Magnetic>
        <div
          onClick={handleCopy}
          role="button"
          tabIndex={0}
          aria-label={copied ? "Copied" : "Copy code"}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              handleCopy();
            }
          }}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
            // cancel most of the parent <pre> vertical padding so one line stays slim
            margin: "-0.35rem 0",
            cursor: "none",
          }}
        >
          {isShell && (
            <span
              aria-hidden
              style={{ userSelect: "none", color: "#907aa9", fontWeight: 700 }}
            >
              $
            </span>
          )}
          <div style={{ flex: 1, minWidth: 0, overflowX: "auto", whiteSpace: "nowrap" }}>
            {body}
          </div>
          <span style={{ ...buttonBase, padding: "0.35rem" }} aria-hidden>
            {copied ? <CheckIcon /> : <CopyIcon />}
          </span>
        </div>
      </Magnetic>
    );
  }

  // ── Multi-line: floating copy button with language tag ───────────────────
  return (
    <Magnetic>
      <div style={{ position: "relative" }}>
        <div
          style={{
            position: "absolute",
            top: "0.5rem",
            right: "0.5rem",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            zIndex: 10,
          }}
        >
          <button
            onClick={handleCopy}
            aria-label={copied ? "Copied" : "Copy code"}
            style={{ ...buttonBase, padding: "0.4rem 0.7rem" }}
          >
            {copied ? <CheckIcon /> : <CopyIcon />}
            {copied ? "Copied!" : "Copy"}
          </button>
        </div>
        {body}
      </div>
    </Magnetic>
  );
}
