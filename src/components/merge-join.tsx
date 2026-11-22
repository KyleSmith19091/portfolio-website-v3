import { motion, useInView } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import { ease } from "./editorial";

const INK = "#171717";
const MUTED = "#70747d";
const FAINT = "#d4d6da";

type Order = { id: number; customerId: number };
type Customer = { id: number; name: string };

// Customer 4 does not exist, so order #104 has no match in a correct join
const ORDERS: Order[] = [
    { id: 101, customerId: 1 },
    { id: 102, customerId: 1 },
    { id: 103, customerId: 2 },
    { id: 104, customerId: 4 },
    { id: 105, customerId: 5 },
    { id: 106, customerId: 5 },
    { id: 107, customerId: 3 },
];

const CUSTOMERS: Customer[] = [
    { id: 2, name: "Grace" },
    { id: 1, name: "Ada" },
    { id: 5, name: "Barbara" },
    { id: 3, name: "Linus" },
];

const modes = [
    {
        id: "sorted",
        label: "ORDER BY customer_id",
        orders: [...ORDERS].sort((a, b) => a.customerId - b.customerId || a.id - b.id),
        customers: [...CUSTOMERS].sort((a, b) => a.id - b.id),
    },
    {
        id: "unsorted",
        label: "No ORDER BY",
        orders: ORDERS,
        customers: CUSTOMERS,
    },
];

type Frame = { i: number; j: number; matches: [number, number][]; note: string; done: boolean };

// The merge step of a sort-merge join. It is only correct when both inputs are sorted on the join key:
// when an order's key is smaller than the current customer's, it assumes no later customer can match.
const merge = (orders: Order[], customers: Customer[]) => {
    const frames: Frame[] = [];
    const matches: [number, number][] = [];
    let i = 0;
    let j = 0;
    let comparisons = 0;

    frames.push({ i, j, matches: [], note: "One pointer at the top of each table.", done: false });

    while (i < orders.length && j < customers.length) {
        const a = orders[i].customerId;
        const b = customers[j].id;
        comparisons++;
        let note: string;
        if (a === b) {
            matches.push([i, j]);
            note = `${a} = ${b}: emit (#${orders[i].id}, ${customers[j].name}), move orders down.`;
            frames.push({ i, j, matches: [...matches], note, done: false });
            i++;
        } else if (a < b) {
            note = `${a} < ${b}: customers is sorted, so no later customer can match. Skip order #${orders[i].id}.`;
            frames.push({ i, j, matches: [...matches], note, done: false });
            i++;
        } else {
            note = `${a} > ${b}: move customers down.`;
            frames.push({ i, j, matches: [...matches], note, done: false });
            j++;
        }
    }

    const expected = orders.filter((o) => customers.some((c) => c.id === o.customerId)).length;
    const lost = expected - matches.length;
    frames.push({
        i,
        j,
        matches: [...matches],
        note:
            lost === 0
                ? `Done: ${matches.length} rows in one pass, ${comparisons} comparisons, no sort.`
                : `Done: ${matches.length} of ${expected} rows. ${lost} rows lost, and nothing reported an error.`,
        done: true,
    });
    return { frames, expected, lost };
};

// Layout, in viewBox units
const TOP = 58;
const ROW = 38;
const OX = 28;
const CX = 290;
const COL = 150;
const HEIGHT = TOP + ORDERS.length * ROW + 24;

const rowY = (k: number) => TOP + k * ROW;

export default function MergeJoin() {
    const [modeIndex, setModeIndex] = useState(0);
    const [frame, setFrame] = useState(0);
    const [playing, setPlaying] = useState(false);
    const ref = useRef<HTMLElement>(null);
    const inView = useInView(ref, { once: true, margin: "-120px" });

    const mode = modes[modeIndex];
    const sorted = mode.id === "sorted";
    const { frames, lost } = useMemo(() => merge(mode.orders, mode.customers), [mode]);
    const current = frames[Math.min(frame, frames.length - 1)];

    useEffect(() => {
        if (inView) setPlaying(true);
    }, [inView]);

    useEffect(() => {
        if (!playing) return;
        if (frame >= frames.length - 1) {
            setPlaying(false);
            return;
        }
        const t = setTimeout(() => setFrame((f) => f + 1), 1100);
        return () => clearTimeout(t);
    }, [playing, frame, frames.length]);

    const choose = (i: number) => {
        setModeIndex(i);
        setFrame(0);
        setPlaying(true);
    };

    const matchedOrders = new Set(current.matches.map(([i]) => i));
    const matchable = (k: number) => mode.customers.some((c) => c.id === mode.orders[k].customerId);
    // An order is behind the pointer once it has been passed; dim it unless it produced a row
    const passed = (k: number) => k < current.i && !matchedOrders.has(k);
    const isLost = (k: number) => current.done && !matchedOrders.has(k) && matchable(k);

    const button = "border border-black px-3 py-1 text-sm cursor-none transition-colors";

    return (
        <figure ref={ref} className="not-prose my-12">
            <div className="flex flex-wrap gap-2 mb-6">
                {modes.map((m, i) => (
                    <button
                        key={m.id}
                        onClick={() => choose(i)}
                        className={`${button} font-mono ${i === modeIndex ? "bg-black text-white" : "bg-white text-black hover:bg-neutral-100"}`}
                    >
                        {m.label}
                    </button>
                ))}
            </div>

            <div className="grid gap-8 md:grid-cols-[minmax(0,1fr)_300px] items-start">
                <div className="overflow-x-auto">
                    <svg
                        viewBox={`0 0 470 ${HEIGHT}`}
                        className="w-full min-w-[340px] max-w-[540px]"
                        role="img"
                        aria-label={`Merge join of an orders table and a customers table ${sorted ? "that are both sorted on the join key" : "that are not sorted"}. A pointer walks down each table and matching rows are joined by a line. ${current.note}`}
                    >
                        <text x={OX} y={TOP - 30} fontSize="12" letterSpacing="2.4" fill={INK}>ORDERS</text>
                        <text x={OX + COL} y={TOP - 30} fontSize="11" textAnchor="end" fill={MUTED}>customer_id</text>
                        <text x={CX} y={TOP - 30} fontSize="12" letterSpacing="2.4" fill={INK}>CUSTOMERS</text>
                        <text x={CX + COL} y={TOP - 30} fontSize="11" textAnchor="end" fill={MUTED}>id</text>

                        {/* Join lines for every emitted row */}
                        {current.matches.map(([i, j]) => (
                            <motion.path
                                key={`${mode.id}-${i}-${j}`}
                                d={`M${OX + COL + 6} ${rowY(i)} C${OX + COL + 50} ${rowY(i)} ${CX - 50} ${rowY(j)} ${CX - 6} ${rowY(j)}`}
                                fill="none" stroke={INK} strokeWidth="1.5"
                                initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.5, ease }}
                            />
                        ))}

                        {mode.orders.map((o, k) => (
                            <motion.g
                                key={o.id}
                                initial={false}
                                animate={{ y: rowY(k), opacity: passed(k) && !isLost(k) ? 0.35 : 1 }}
                                transition={{ duration: 0.6, ease }}
                            >
                                <line x1={OX} x2={OX + COL} y1={ROW / 2} y2={ROW / 2} stroke={FAINT} />
                                <text x={OX + 10} y={5} fontSize="14" fontFamily="ui-monospace, monospace" fill={INK}>#{o.id}</text>
                                <text x={OX + COL - 10} y={5} fontSize="14" fontFamily="ui-monospace, monospace" textAnchor="end" fill={INK}>
                                    {o.customerId}
                                </text>
                                {isLost(k) && (
                                    <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4, ease }}>
                                        <rect x={OX + COL + 10} y={-9} width="40" height="18" fill={INK} />
                                        <text x={OX + COL + 30} y={4} fontSize="10" letterSpacing="1.2" textAnchor="middle" fill="#fff">LOST</text>
                                    </motion.g>
                                )}
                            </motion.g>
                        ))}

                        {mode.customers.map((c, k) => (
                            <motion.g
                                key={c.id}
                                initial={false}
                                animate={{ y: rowY(k), opacity: k < current.j ? 0.35 : 1 }}
                                transition={{ duration: 0.6, ease }}
                            >
                                <line x1={CX} x2={CX + COL} y1={ROW / 2} y2={ROW / 2} stroke={FAINT} />
                                <text x={CX + 10} y={5} fontSize="14" fill={INK}>{c.name}</text>
                                <text x={CX + COL - 10} y={5} fontSize="14" fontFamily="ui-monospace, monospace" textAnchor="end" fill={INK}>
                                    {c.id}
                                </text>
                            </motion.g>
                        ))}

                        {/* Pointers: a frame around the row each side is looking at */}
                        <motion.rect
                            x={OX - 4} width={COL + 8} height={ROW - 6} fill="none" stroke={INK} strokeWidth="1.5"
                            initial={false}
                            animate={{ y: rowY(Math.min(current.i, mode.orders.length - 1)) - (ROW - 6) / 2, opacity: current.done ? 0 : 1 }}
                            transition={{ duration: 0.4, ease }}
                        />
                        <motion.rect
                            x={CX - 4} width={COL + 8} height={ROW - 6} fill="none" stroke={INK} strokeWidth="1.5"
                            initial={false}
                            animate={{ y: rowY(Math.min(current.j, mode.customers.length - 1)) - (ROW - 6) / 2, opacity: current.done ? 0 : 1 }}
                            transition={{ duration: 0.4, ease }}
                        />
                    </svg>
                </div>

                <div className="text-sm">
                    <div className="text-xs tracking-[0.2em] text-[#70747d] mb-2">CALL SITE</div>
                    <pre className="font-mono text-[12px] leading-relaxed border-t border-b border-black py-3 overflow-x-auto">
                        {sorted ? (
                            <>
                                <span className="text-[#70747d]">-- both queries use ORDER BY{"\n"}</span>
                                {"let o ← fetchOrders\n"}
                                {"let c ← fetchCustomers\n"}
                                {"mergeJoin o.val o.property\n"}
                                {"          c.val c.property"}
                            </>
                        ) : (
                            <>
                                <span className="text-[#70747d]">-- plain List, no proof{"\n"}</span>
                                {"let o ← fetchOrdersRaw\n"}
                                {"let c ← fetchCustomersRaw\n"}
                                {"mergeJoin o "}
                                <span className="underline decoration-wavy decoration-1 underline-offset-2">_</span>
                                {" c _"}
                            </>
                        )}
                    </pre>

                    <div className="flex items-start gap-2 mt-4 font-mono text-[12px]">
                        <span className={`mt-1 w-2.5 h-2.5 shrink-0 ${sorted ? "rounded-full bg-black" : "bg-black"}`} />
                        {sorted ? (
                            <span>
                                compiles: <span className="text-[#70747d]">o.property : o.val.Pairwise (·.customerId ≤ ·.customerId)</span>
                            </span>
                        ) : (
                            <span>
                                error: don&apos;t know how to synthesize placeholder for argument &apos;hO&apos;
                                <span className="block text-[#70747d] mt-1">⊢ o.Pairwise (·.customerId ≤ ·.customerId)</span>
                            </span>
                        )}
                    </div>

                    {!sorted && (
                        <p className="mt-4 text-[#70747d]">Lean stops here. The animation shows what would run if it did not.</p>
                    )}

                    <p className={`mt-6 min-h-[4.5rem] ${current.done ? "font-medium" : ""}`}>{current.note}</p>

                    <dl className="grid grid-cols-2 gap-y-1 mt-2 font-mono text-[13px]">
                        <dt className="text-[#70747d]">rows emitted</dt>
                        <dd>{current.matches.length}</dd>
                        <dt className="text-[#70747d]">rows lost</dt>
                        <dd>{current.done ? lost : "–"}</dd>
                    </dl>

                    <div className="flex gap-2 mt-6">
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
                A merge join walks down both tables once. When an order&apos;s key is smaller than the current customer&apos;s, it skips the
                order, because in sorted input no later customer can match. That step is only correct if the input is sorted. In Lean, that
                assumption is an argument to the function, so an unsorted call does not compile. Without that check, the join returns fewer rows and
                reports no error.
            </figcaption>
        </figure>
    );
}
