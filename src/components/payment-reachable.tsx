import { motion } from "framer-motion";
import { ease } from "./editorial";

const INK = "#171717";
const MUTED = "#70747d";

const W = 150;
const H = 60;

// One payment, two workers, at-least-once delivery. A state is (status, charges).
const states = [
    { id: "S0", status: "PENDING", charges: 0, x: 85, y: 100 },
    { id: "S1", status: "PROCESSING", charges: 0, x: 300, y: 100 },
    { id: "S2", status: "PROCESSING", charges: 1, x: 515, y: 100 },
    { id: "S3", status: "COMPLETED", charges: 1, x: 790, y: 100 },
    { id: "S4", status: "FAILED", charges: 0, x: 300, y: 250 },
    { id: "S5", status: "PROCESSING", charges: 2, x: 515, y: 250, bad: true },
];

// `trace` marks the counterexample path the checker reports
const edges: { d: string; label: string; label2?: string; lx: number; ly: number; trace: boolean; marker: string; anchor?: "start" | "middle" }[] = [
    { d: "M160 100 L222 100", label: "consume", lx: 191, ly: 86, trace: true, marker: "pr-ink" },
    { d: "M375 100 L437 100", label: "charge", lx: 406, ly: 86, trace: true, marker: "pr-ink" },
    { d: "M590 100 L713 100", label: "update status", lx: 651, ly: 86, trace: false, marker: "pr-muted" },
    { d: "M300 130 L300 218", label: "declined", lx: 312, ly: 180, trace: false, marker: "pr-muted", anchor: "start" },
    { d: "M515 130 L515 218", label: "crash, redelivery:", label2: "second worker charges", lx: 527, ly: 175, trace: true, marker: "pr-ink", anchor: "start" },
];

const fade = { hidden: { opacity: 0 }, visible: { opacity: 1 } };
const draw = { hidden: { pathLength: 0 }, visible: { pathLength: 1 } };

// Reachable-state graph of the payment model. The path S0 → S1 → S2 → S5 is the counterexample:
// S5 is the only state that breaks "at most one charge per payment", drawn as a filled box.
export default function PaymentReachable() {
    return (
        <figure className="not-prose my-14 overflow-x-auto lg:-mx-12 xl:-mx-32">
            <motion.svg
                viewBox="0 0 880 320"
                className="w-full min-w-[700px]"
                role="img"
                aria-label="Reachable state graph with six states. S0 is PENDING with no charges. S1 is PROCESSING with no charges. From S1 the payment either fails in S4, or is charged once in S2. From S2 the payment either completes in S3, or, after a crash and a redelivered event, a second worker charges again and reaches S5, where the customer has been charged twice."
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-80px" }}
            >
                <defs>
                    {[["pr-ink", INK], ["pr-muted", MUTED]].map(([id, color]) => (
                        <marker key={id} id={id} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                            <path d="M0 1 L9 5 L0 9" fill="none" stroke={color} strokeWidth="1.5" />
                        </marker>
                    ))}
                </defs>

                <motion.g variants={fade} transition={{ duration: 0.6, ease }}>
                    <circle cx="4" cy="100" r="3.5" fill={INK} />
                </motion.g>

                {edges.map((e, i) => (
                    <motion.g key={e.label} variants={fade} transition={{ duration: 0.6, delay: 0.5 + i * 0.3, ease }}>
                        <motion.path
                            d={e.d} fill="none" stroke={e.trace ? INK : MUTED} strokeWidth={e.trace ? 2 : 1.5}
                            markerEnd={`url(#${e.marker})`}
                            variants={draw} transition={{ duration: 0.7, delay: 0.5 + i * 0.3, ease }}
                        />
                        <text x={e.lx} y={e.ly} textAnchor={e.anchor ?? "middle"} fontSize="14" fill={e.trace ? INK : MUTED}>{e.label}</text>
                        {e.label2 && (
                            <text x={e.lx} y={e.ly + 18} textAnchor="start" fontSize="14" fill={INK}>{e.label2}</text>
                        )}
                    </motion.g>
                ))}

                {states.map((s, i) => (
                    <motion.g key={s.id} variants={fade} transition={{ duration: 0.6, delay: i * 0.15, ease }}>
                        <rect
                            x={s.x - W / 2} y={s.y - H / 2} width={W} height={H}
                            fill={s.bad ? INK : "#ffffff"} stroke={INK} strokeWidth="1.5"
                        />
                        <text x={s.x} y={s.y - 6} textAnchor="middle" fontSize="12" letterSpacing="2.4" fill={s.bad ? "#ffffff" : INK}>
                            {s.id} · {s.status}
                        </text>
                        <text x={s.x} y={s.y + 14} textAnchor="middle" fontSize="12" fill={s.bad ? "#c4c7cc" : MUTED}>
                            charges = {s.charges}
                        </text>
                    </motion.g>
                ))}

                <motion.text
                    x="700" y="270" fontSize="12" letterSpacing="2.4" fill={MUTED}
                    variants={fade} transition={{ duration: 0.6, delay: 2.2, ease }}
                >
                    <tspan x="620" dy="0">FILLED = INVARIANT BROKEN</tspan>
                    <tspan x="620" dy="18">BOLD PATH = COUNTEREXAMPLE</tspan>
                </motion.text>
            </motion.svg>
        </figure>
    );
}
