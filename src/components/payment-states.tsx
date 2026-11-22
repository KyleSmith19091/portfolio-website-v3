import { motion } from "framer-motion";
import { ease } from "./editorial";

const INK = "#171717";
const MUTED = "#70747d";

const W = 140;
const H = 56;

const states = [
    { name: "PENDING", note: "record written", x: 100, y: 170 },
    { name: "PROCESSING", note: "worker charging", x: 400, y: 170 },
    { name: "COMPLETED", note: "charge succeeded", x: 700, y: 90 },
    { name: "FAILED", note: "charge declined", x: 700, y: 250 },
];

const edges = [
    { d: "M170 170 L328 170", label: "event consumed", lx: 249, ly: 156 },
    { d: "M470 156 L628 98", label: "charged", lx: 549, ly: 112 },
    { d: "M470 184 L628 242", label: "declined", lx: 549, ly: 242 },
];

const fade = { hidden: { opacity: 0 }, visible: { opacity: 1 } };
const draw = { hidden: { pathLength: 0 }, visible: { pathLength: 1 } };

// State machine for a payment, drawn in the site's ink-on-white style.
// The dashed loop on PROCESSING is the hazard: a redelivered or retried event re-enters a state that already charged.
export default function PaymentStates() {
    return (
        <figure className="not-prose my-12 overflow-x-auto">
            <motion.svg
                viewBox="0 0 800 330"
                className="w-full min-w-[640px]"
                role="img"
                aria-label="State machine: a payment starts as PENDING, moves to PROCESSING when a worker consumes the event, then to COMPLETED if the charge succeeds or FAILED if it is declined. A dashed loop on PROCESSING marks a crash or redelivered event re-entering the same state."
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-80px" }}
            >
                <defs>
                    <marker id="ps-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                        <path d="M0 1 L9 5 L0 9" fill="none" stroke={INK} strokeWidth="1.5" />
                    </marker>
                </defs>

                {/* Entry point */}
                <motion.g variants={fade} transition={{ duration: 0.6, ease }}>
                    <circle cx="8" cy="170" r="4" fill={INK} />
                    <line x1="12" y1="170" x2="28" y2="170" stroke={INK} strokeWidth="1.5" markerEnd="url(#ps-arrow)" />
                </motion.g>

                {edges.map((e, i) => (
                    <motion.g key={e.label} variants={fade} transition={{ duration: 0.6, delay: 0.5 + i * 0.35, ease }}>
                        <motion.path
                            d={e.d} fill="none" stroke={INK} strokeWidth="1.5" markerEnd="url(#ps-arrow)"
                            variants={draw} transition={{ duration: 0.7, delay: 0.5 + i * 0.35, ease }}
                        />
                        <text x={e.lx} y={e.ly} textAnchor="middle" fontSize="14" fill={INK}>{e.label}</text>
                    </motion.g>
                ))}

                {/* Self loop: crash or redelivery re-enters PROCESSING */}
                <motion.g variants={fade} transition={{ duration: 0.6, delay: 1.6, ease }}>
                    <motion.path
                        d="M365 142 C365 80, 435 80, 435 142" fill="none" stroke={MUTED} strokeWidth="1.5"
                        strokeDasharray="4 4" markerEnd="url(#ps-arrow)"
                        variants={draw} transition={{ duration: 0.8, delay: 1.6, ease }}
                    />
                    <text x="400" y="68" textAnchor="middle" fontSize="14" fill={INK}>crash or redelivery</text>
                    <text x="400" y="86" textAnchor="middle" fontSize="12" fill={MUTED}>charges again?</text>
                </motion.g>

                {states.map((s, i) => (
                    <motion.g key={s.name} variants={fade} transition={{ duration: 0.6, delay: i * 0.15, ease }}>
                        <rect x={s.x - W / 2} y={s.y - H / 2} width={W} height={H} fill="#ffffff" stroke={INK} strokeWidth="1.5" />
                        <text x={s.x} y={s.y - 3} textAnchor="middle" fontSize="12" letterSpacing="2.4" fill={INK}>{s.name}</text>
                        <text x={s.x} y={s.y + 15} textAnchor="middle" fontSize="12" fill={MUTED}>{s.note}</text>
                    </motion.g>
                ))}
            </motion.svg>
        </figure>
    );
}
