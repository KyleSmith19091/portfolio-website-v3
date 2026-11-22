import { motion } from "framer-motion";
import { useState } from "react";
import { ease } from "./editorial";

const INK = "#171717";
const MUTED = "#70747d";
const FAINT = "#d4d6da";

type PathId = "sqlPrepared" | "sqlAdhoc" | "handC" | "printedC" | "leanIO";
type Mode = "perQuery" | "open";

const PATHS: { id: PathId; label: string; note: string; fill: string; stroke?: string }[] = [
    { id: "sqlPrepared", label: "SQL (prepared)", note: "ORDER BY id DESC LIMIT ?, prepared once", fill: INK },
    { id: "sqlAdhoc", label: "SQL (prepare each time)", note: "same query, parsed on every call", fill: MUTED },
    { id: "handC", label: "B-tree, hand-written C", note: "Last, then Previous, in c/sqlite_shim.c", fill: "#b8bbc1" },
    { id: "printedC", label: "B-tree, C printed by Lean", note: "Emit.lean prints the same loop as C", fill: "#e6e7ea", stroke: INK },
    { id: "leanIO", label: "B-tree, Lean-compiled planIO", note: "Lean compiles the plan, calls SQLite over FFI", fill: "#ffffff", stroke: INK },
];

// Nanoseconds per query on the 1,000,000 row table (11,702 pages).
// The "open" mode has no SQL columns: SQL always starts its own transaction.
const DATA: Record<Mode, { n: number; values: Partial<Record<PathId, number>> }[]> = {
    perQuery: [
        { n: 1, values: { sqlPrepared: 4907.9, sqlAdhoc: 8343.5, handC: 4766.9, printedC: 4751.7, leanIO: 4917.2 } },
        { n: 20, values: { sqlPrepared: 6064.0, sqlAdhoc: 9512.2, handC: 5255.3, printedC: 5260.0, leanIO: 10080.2 } },
        { n: 2000, values: { sqlPrepared: 124125.0, sqlAdhoc: 128092.6, handC: 51006.8, printedC: 50901.1, leanIO: 453222.6 } },
    ],
    open: [
        { n: 1, values: { handC: 22.6, printedC: 22.6, leanIO: 128.5 } },
        { n: 20, values: { handC: 505.3, printedC: 504.8, leanIO: 5200.6 } },
        { n: 2000, values: { handC: 45757.9, printedC: 45918.1, leanIO: 447258.7 } },
    ],
};

const MODES: { id: Mode; label: string; blurb: string }[] = [
    {
        id: "perQuery",
        label: "One transaction per query",
        blurb: "Every query opens and closes its own read transaction, the way the SQL engine does for each statement.",
    },
    {
        id: "open",
        label: "Transaction kept open",
        blurb: "One read transaction and one cursor, opened once and reused. SQL has no bar here because it cannot skip the transaction.",
    },
];

const maxOf = (g: { values: Partial<Record<PathId, number>> }) => Math.max(...Object.values(g.values).map((v) => v ?? 0));

const fmt = (ns: number) => {
    if (ns < 1000) return `${ns < 100 ? ns.toFixed(1) : Math.round(ns)} ns`;
    if (ns < 1_000_000) return `${(ns / 1000).toFixed(ns < 10_000 ? 1 : 0)} µs`;
    return `${(ns / 1_000_000).toFixed(1)} ms`;
};

export default function Benchmarks() {
    const [mode, setMode] = useState<Mode>("perQuery");
    const [hover, setHover] = useState<PathId | null>(null);

    const groups = DATA[mode];
    const paths = PATHS.filter((p) => groups.some((g) => g.values[p.id] !== undefined));
    const current = MODES.find((m) => m.id === mode)!;

    return (
        <figure className="not-prose my-12">
            <div className="text-xs tracking-[0.2em] text-[#70747d] mb-2">TIME PER QUERY, 1,000,000 ROWS  ·  LOWER IS BETTER</div>

            <div role="tablist" className="flex flex-wrap gap-2 mb-3">
                {MODES.map((m) => (
                    <button
                        key={m.id}
                        role="tab"
                        aria-selected={mode === m.id}
                        onClick={() => setMode(m.id)}
                        className={`border border-black px-3 py-1 text-sm cursor-none transition-colors ${
                            mode === m.id ? "bg-black text-white" : "bg-white hover:bg-neutral-100"
                        }`}
                    >
                        {m.label}
                    </button>
                ))}
            </div>
            <p className="text-sm text-[#70747d] mb-6 max-w-[60ch]">{current.blurb}</p>

            {/* legend */}
            <div className="flex flex-wrap gap-x-5 gap-y-2 mb-6 text-[12px] font-mono">
                {paths.map((p) => (
                    <button
                        key={p.id}
                        type="button"
                        onMouseEnter={() => setHover(p.id)}
                        onMouseLeave={() => setHover(null)}
                        onFocus={() => setHover(p.id)}
                        onBlur={() => setHover(null)}
                        className="flex items-center gap-2 cursor-none"
                        style={{ opacity: hover && hover !== p.id ? 0.35 : 1 }}
                    >
                        <span className="inline-block w-3 h-3" style={{ background: p.fill, border: `1px solid ${p.stroke ?? p.fill}` }} />
                        {p.label}
                    </button>
                ))}
            </div>

            <div className="border-t border-black">
                {groups.map((g) => (
                    <div key={`${mode}-${g.n}`} className="py-5 border-b border-[#d4d6da] grid gap-3 md:grid-cols-[5.5rem_minmax(0,1fr)]">
                        <div className="font-mono text-sm">
                            n = {g.n.toLocaleString("en-US")}
                            <div className="text-[11px] text-[#70747d]">{g.n === 1 ? "1 row" : `${g.n.toLocaleString("en-US")} rows`}</div>
                        </div>

                        <div className="relative">
                            <div className="relative space-y-[6px]">
                                {paths.map((p) => {
                                    const v = g.values[p.id];
                                    if (v === undefined) return null;
                                    // Linear: each bar is proportional to its time. The slowest bar in the group fills 80% of the width.
                                    const w = Math.max((v / maxOf(g)) * 80, 0.5);
                                    const dim = hover && hover !== p.id;
                                    return (
                                        <div key={p.id} className="flex items-center h-[18px]" style={{ opacity: dim ? 0.3 : 1, transition: "opacity .15s" }}>
                                            <motion.div
                                                className="h-full origin-left shrink-0"
                                                style={{ background: p.fill, border: `1px solid ${p.stroke ?? p.fill}` }}
                                                initial={{ width: 0 }}
                                                animate={{ width: `${w}%` }}
                                                transition={{ duration: 0.7, ease }}
                                            />
                                            <span className="ml-2 font-mono text-[11px] whitespace-nowrap">{fmt(v)}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <p className="font-mono text-[11px] text-[#70747d] mt-3">
                Linear scale: bars are proportional to time, and each row of bars is scaled to its slowest bar. Apple M2 Pro, SQLite 3.54.1, cc -O2, Lean 4.36.0. Warm cache, one run of 300 ms per bar.
            </p>
        </figure>
    );
}
