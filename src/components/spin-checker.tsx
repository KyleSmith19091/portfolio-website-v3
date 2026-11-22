import { motion, useInView } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import { ease } from "./editorial";

const INK = "#171717";
const MUTED = "#70747d";
const FAINT = "#d4d6da";

const PENDING = 0;
const PROCESSING = 1;
const COMPLETED = 2;
const STATUS = ["PENDING", "PROCESSING", "COMPLETED"];

type State = { pc: [number, number]; status: number; count: number };

// A statement returns the next globals and where the worker's program counter goes, or null when its guard blocks
type Statement = (s: State) => { status?: number; count?: number; jump?: boolean } | null;

type Spec = { id: string; label: string; lines: string[]; steps: Statement[] };

const charge: Statement = (s) => ({ count: s.count + 1 });
const complete: Statement = () => ({ status: COMPLETED });

// The three versions of the Worker proctype from the post. `lines` is the statement each program counter sits on.
const specs: Spec[] = [
    {
        id: "none",
        label: "No guard",
        lines: ["charge_count++", "status = COMPLETED", "end"],
        steps: [charge, complete],
    },
    {
        id: "check",
        label: "Check, then set",
        lines: ["status == PENDING", "status = PROCESSING", "charge_count++", "status = COMPLETED", "end"],
        steps: [(s) => (s.status === PENDING ? {} : null), () => ({ status: PROCESSING }), charge, complete],
    },
    {
        id: "atomic",
        label: "Atomic check-and-set",
        lines: ["atomic check-and-set", "charge_count++", "status = COMPLETED", "end"],
        steps: [(s) => (s.status === PENDING ? { status: PROCESSING } : { jump: true }), charge, complete],
    },
];

const keyOf = (s: State) => `${s.pc[0]},${s.pc[1]},${s.status},${s.count}`;

// Both ltl properties are safety properties, so a single bad state is enough to break them
const violation = (s: State) =>
    s.count > 1 ? "charge_at_most_once" : s.status === COMPLETED && s.count !== 1 ? "always_succeeds" : null;

type Frame = { at: string; stack: string[]; seen: number; edges: string[]; note: string; error: boolean; done: boolean };

// Replays SPIN's search: depth-first from the initial state, storing every state it reaches and
// backtracking when a state is already stored. It stops at the first state that breaks a property.
const explore = (spec: Spec) => {
    const states = new Map<string, State>();
    const order: string[] = [];
    const edges: string[] = [];
    const frames: Frame[] = [];
    const stack: string[] = [];
    let error = false;

    const snap = (at: string, note: string, done = false) =>
        frames.push({ at, stack: [...stack], seen: order.length, edges: [...edges], note, error, done });

    const visit = (s: State, note: string) => {
        const key = keyOf(s);
        states.set(key, s);
        order.push(key);
        stack.push(key);
        const broken = violation(s);
        if (broken) {
            error = true;
            snap(key, `${broken} violated: charge_count = ${s.count}, status = ${STATUS[s.status]}`, true);
            return;
        }
        snap(key, note);

        for (const w of [0, 1]) {
            const pc = s.pc[w];
            if (pc >= spec.steps.length) continue;
            const result = spec.steps[pc](s);
            const who = `W${w + 1}`;
            if (!result) {
                snap(key, `${who} blocked on ${spec.lines[pc]}: status is ${STATUS[s.status]}`);
                continue;
            }
            const nextPc: [number, number] = [...s.pc];
            nextPc[w] = result.jump ? spec.steps.length : pc + 1;
            const next: State = { pc: nextPc, status: result.status ?? s.status, count: result.count ?? s.count };
            const nextKey = keyOf(next);
            edges.push(`${key}>${nextKey}`);
            if (states.has(nextKey)) {
                snap(key, `${who}: ${spec.lines[pc]} leads to a stored state, skip`);
                continue;
            }
            visit(next, result.jump ? `${who}: status is not PENDING, goto end` : `${who}: ${spec.lines[pc]}`);
            if (error) return;
        }
        stack.pop();
        if (stack.length) snap(stack[stack.length - 1], "no more moves, backtrack");
    };

    visit({ pc: [0, 0], status: PENDING, count: 0 }, "initial state");
    if (!error) snap(keyOf({ pc: [0, 0], status: PENDING, count: 0 }), `search complete: ${order.length} states, 0 errors`, true);
    return { states, order, frames };
};

// Plot area, in viewBox units. Worker 1's program counter runs along x, worker 2's up y.
const X0 = 70;
const Y0 = 360;
const SIZE = 300;

export default function SpinChecker() {
    const [specIndex, setSpecIndex] = useState(0);
    const [frame, setFrame] = useState(0);
    const [playing, setPlaying] = useState(false);
    const ref = useRef<HTMLElement>(null);
    const inView = useInView(ref, { once: true, margin: "-120px" });

    const spec = specs[specIndex];
    const { states, order, frames } = useMemo(() => explore(spec), [spec]);
    const current = frames[Math.min(frame, frames.length - 1)];

    const n = spec.lines.length;
    const gap = SIZE / (n - 1);

    // States that share both program counters but differ in globals sit side by side
    const position = useMemo(() => {
        const byPoint = new Map<string, string[]>();
        order.forEach((k) => {
            const pc = states.get(k)!.pc.join(",");
            byPoint.set(pc, [...(byPoint.get(pc) ?? []), k]);
        });
        const out = new Map<string, { x: number; y: number }>();
        byPoint.forEach((keys) =>
            keys.forEach((k, i) => {
                const [a, b] = states.get(k)!.pc;
                out.set(k, { x: X0 + a * gap + (i - (keys.length - 1) / 2) * 14, y: Y0 - b * gap });
            }),
        );
        return out;
    }, [order, states, gap]);

    useEffect(() => {
        if (inView) setPlaying(true);
    }, [inView]);

    useEffect(() => {
        if (!playing) return;
        if (frame >= frames.length - 1) {
            setPlaying(false);
            return;
        }
        const t = setTimeout(() => setFrame((f) => f + 1), 650);
        return () => clearTimeout(t);
    }, [playing, frame, frames.length]);

    const choose = (i: number) => {
        setSpecIndex(i);
        setFrame(0);
        setPlaying(true);
    };

    const seen = new Set(order.slice(0, current.seen));
    const onStack = new Set(current.stack.slice(1).map((k, i) => `${current.stack[i]}>${k}`));
    const at = states.get(current.at)!;
    const here = position.get(current.at)!;

    const ends = (e: string) => e.split(">").map((k) => position.get(k)!);
    const isJump = (e: string) => {
        const [from, to] = ends(e);
        return Math.max(Math.abs(to.x - from.x), Math.abs(to.y - from.y)) > gap + 1;
    };

    const edgePath = (e: string) => {
        const [from, to] = ends(e);
        if (!isJump(e)) return `M${from.x} ${from.y} L${to.x} ${to.y}`;
        // A goto skips several statements at once: bow it so it doesn't run through the states in between
        const bow = to.y === from.y ? { x: 0, y: 22 } : { x: -22, y: 0 };
        return `M${from.x} ${from.y} Q${(from.x + to.x) / 2 + bow.x} ${(from.y + to.y) / 2 + bow.y} ${to.x} ${to.y}`;
    };

    const button = "border border-black px-3 py-1 text-sm cursor-none transition-colors";

    return (
        <figure ref={ref} className="not-prose my-12">
            <div className="flex flex-wrap gap-2 mb-6">
                {specs.map((s, i) => (
                    <button
                        key={s.id}
                        onClick={() => choose(i)}
                        className={`${button} ${i === specIndex ? "bg-black text-white" : "bg-white text-black hover:bg-neutral-100"}`}
                    >
                        {s.label}
                    </button>
                ))}
            </div>

            <div className="grid gap-8 md:grid-cols-[minmax(0,1fr)_260px] items-start">
                <div className="overflow-x-auto">
                    <svg
                        viewBox="0 0 420 420"
                        className="w-full min-w-[340px] max-w-[520px]"
                        role="img"
                        aria-label={`SPIN's depth-first search over the states of two workers running the "${spec.label}" spec. Each dot is a pair of program counters: moving right means worker 1 ran a statement, moving up means worker 2 did. ${current.note}.`}
                    >
                        <defs>
                            <marker id="sc-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                                <path d="M0 1 L9 5 L0 9" fill="none" stroke={MUTED} strokeWidth="1.5" />
                            </marker>
                        </defs>

                        {/* Every pair of program counters, reachable or not */}
                        {spec.lines.map((_, a) =>
                            spec.lines.map((_, b) => (
                                <circle key={`${a},${b}`} cx={X0 + a * gap} cy={Y0 - b * gap} r="3" fill={FAINT} />
                            )),
                        )}

                        {spec.lines.map((_, i) => (
                            <g key={i} fontSize="11" fill={MUTED}>
                                <text x={X0 + i * gap} y={Y0 + 24} textAnchor="middle">{i}</text>
                                <text x={X0 - 22} y={Y0 - i * gap + 4} textAnchor="middle">{i}</text>
                            </g>
                        ))}
                        <text x={X0 + SIZE / 2} y={Y0 + 48} textAnchor="middle" fontSize="12" letterSpacing="2.4" fill={INK}>WORKER 1 LINE</text>
                        <text
                            x={X0 - 48} y={Y0 - SIZE / 2} textAnchor="middle" fontSize="12" letterSpacing="2.4" fill={INK}
                            transform={`rotate(-90 ${X0 - 48} ${Y0 - SIZE / 2})`}
                        >
                            WORKER 2 LINE
                        </text>

                        {current.edges.map((e) => (
                            <motion.path
                                key={`${spec.id}-${e}`}
                                d={edgePath(e)} fill="none"
                                stroke={onStack.has(e) ? INK : MUTED} strokeWidth={onStack.has(e) ? 2 : 1}
                                markerEnd={onStack.has(e) ? undefined : "url(#sc-arrow)"}
                                // pathLength drives the dash pattern, so a dashed goto fades in rather than draws
                                {...(isJump(e)
                                    ? { strokeDasharray: "3 4", initial: { opacity: 0 }, animate: { opacity: 1 } }
                                    : { initial: { pathLength: 0 }, animate: { pathLength: 1 } })}
                                transition={{ duration: 0.45, ease }}
                            />
                        ))}

                        {order.filter((k) => seen.has(k)).map((k) => {
                            const p = position.get(k)!;
                            const bad = violation(states.get(k)!);
                            return bad ? (
                                <motion.rect
                                    key={`${spec.id}-${k}`} x={p.x - 8} y={p.y - 8} width="16" height="16" fill={INK}
                                    initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ duration: 0.4, ease }}
                                    style={{ transformOrigin: `${p.x}px ${p.y}px` }}
                                />
                            ) : (
                                <motion.circle
                                    key={`${spec.id}-${k}`} cx={p.x} cy={p.y} r="5.5" fill={INK}
                                    initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ duration: 0.4, ease }}
                                    style={{ transformOrigin: `${p.x}px ${p.y}px` }}
                                />
                            );
                        })}

                        <motion.circle
                            r="12" fill="none" stroke={INK} strokeWidth="1.5"
                            initial={false} animate={{ cx: here.x, cy: here.y }} transition={{ duration: 0.35, ease }}
                        />
                    </svg>
                </div>

                <div className="text-sm">
                    <div className="text-xs tracking-[0.2em] text-[#70747d] mb-2">WORKER</div>
                    <ol className="font-mono text-[13px] border-t border-black">
                        {spec.lines.map((line, i) => (
                            <li key={line} className="flex items-center gap-2 py-1.5 border-b border-neutral-200">
                                <span className="w-4 text-[#70747d]">{i}</span>
                                <span className="flex-1 whitespace-nowrap">{line}</span>
                                {[0, 1].map((w) => (
                                    <span
                                        key={w}
                                        className={`w-7 text-center text-[11px] ${at.pc[w] === i ? "bg-black text-white" : "text-transparent"}`}
                                    >
                                        W{w + 1}
                                    </span>
                                ))}
                            </li>
                        ))}
                    </ol>

                    <dl className="grid grid-cols-2 gap-y-1 mt-6 font-mono text-[13px]">
                        <dt className="text-[#70747d]">status</dt>
                        <dd>{STATUS[at.status]}</dd>
                        <dt className="text-[#70747d]">charge_count</dt>
                        <dd>{at.count}</dd>
                        <dt className="text-[#70747d]">states stored</dt>
                        <dd>{current.seen}</dd>
                        <dt className="text-[#70747d]">search depth</dt>
                        <dd>{Math.max(current.stack.length - 1, 0)}</dd>
                    </dl>

                    <p className={`mt-6 min-h-[3rem] ${current.done ? "font-medium" : ""}`}>
                        {current.error && current.done ? "Counterexample found. " : ""}
                        {current.note}
                    </p>

                    <div className="flex gap-2 mt-4">
                        <button
                            onClick={() => (frame >= frames.length - 1 ? (setFrame(0), setPlaying(true)) : setPlaying(!playing))}
                            className={`${button} bg-white hover:bg-neutral-100`}
                        >
                            {playing ? "Pause" : frame >= frames.length - 1 ? "Replay" : "Play"}
                        </button>
                        <button
                            onClick={() => {
                                setPlaying(false);
                                setFrame((f) => Math.min(f + 1, frames.length - 1));
                            }}
                            className={`${button} bg-white hover:bg-neutral-100`}
                        >
                            Step
                        </button>
                    </div>
                </div>
            </div>

            <figcaption className="mt-6 text-sm text-[#70747d]">
                Each dot is one pair of program counters. A step right means worker 1 ran a statement, a step up means worker 2 did, so every
                path from the bottom-left is one interleaving. Grey dots are not reached (yet) and dashed edges are a goto. The bold path is the search stack, which SPIN
                prints as the trail when it finds a bad state (the filled square).
            </figcaption>
        </figure>
    );
}
