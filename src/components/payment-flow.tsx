import { motion } from "framer-motion";
import { ease } from "./editorial";

const lanes = [
    { name: "Client", x: 70 },
    { name: "API", x: 215 },
    { name: "Database", x: 360 },
    { name: "Broker", x: 505 },
    { name: "Worker", x: 650 },
];

const x = (name: string) => lanes.find((l) => l.name === name)!.x;

const steps = [
    { from: "Client", to: "API", y: 130, label: "payment request" },
    { from: "API", to: "Database", y: 195, label: "write payment record" },
    { from: "API", to: "Broker", y: 260, label: "publish event" },
    { from: "Broker", to: "Worker", y: 325, label: "consume event" },
    { from: "Worker", to: "Database", y: 450, label: "update status" },
];

const INK = "#171717";
const MUTED = "#70747d";
const FAINT = "#c4c7cc";

// Sequence diagram of the payment flow, drawn in the site's ink-on-white style.
// Lifelines draw in first, then each step's arrow appears in order.
export default function PaymentFlow() {
    return (
        <figure className="not-prose my-14 overflow-x-auto lg:-mx-12 xl:-mx-32">
            <motion.svg
                viewBox="0 0 720 500"
                className="w-full min-w-[600px]"
                role="img"
                aria-label="Sequence diagram: the client sends a payment request to the API, which writes a payment record to the database and publishes an event to the broker. A worker consumes the event, charges the customer and updates the payment status in the database."
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-80px" }}
            >
                <defs>
                    <marker id="pf-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                        <path d="M0 1 L9 5 L0 9" fill="none" stroke={INK} strokeWidth="1.5" />
                    </marker>
                </defs>

                {lanes.map((lane, i) => (
                    <g key={lane.name}>
                        <text x={lane.x} y="40" textAnchor="middle" fontSize="12" letterSpacing="2.4" fill={MUTED}>
                            {lane.name.toUpperCase()}
                        </text>
                        <motion.line
                            x1={lane.x} y1="58" x2={lane.x} y2="480"
                            stroke={FAINT} strokeWidth="1" strokeDasharray="3 5"
                            variants={{ hidden: { pathLength: 0 }, visible: { pathLength: 1 } }}
                            transition={{ duration: 1.2, delay: i * 0.08, ease }}
                        />
                    </g>
                ))}

                {steps.map((s, i) => {
                    const a = x(s.from);
                    const b = x(s.to);
                    const dir = b > a ? 1 : -1;
                    const delay = 0.6 + i * 0.35;
                    return (
                        <motion.g
                            key={s.label}
                            variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }}
                            transition={{ duration: 0.6, delay, ease }}
                        >
                            <motion.line
                                x1={a} y1={s.y} x2={b - dir * 3} y2={s.y}
                                stroke={INK} strokeWidth="1.5" markerEnd="url(#pf-arrow)"
                                variants={{ hidden: { pathLength: 0 }, visible: { pathLength: 1 } }}
                                transition={{ duration: 0.7, delay, ease }}
                            />
                            <circle cx={a} cy={s.y} r="3.5" fill={INK} />
                            <text x={(a + b) / 2} y={s.y - 28} textAnchor="middle" fontSize="12" fill={MUTED} className="tabular-nums">
                                {String(i + 1).padStart(2, "0")}
                            </text>
                            <text x={(a + b) / 2} y={s.y - 11} textAnchor="middle" fontSize="14" fill={INK}>
                                {s.label}
                            </text>
                        </motion.g>
                    );
                })}

                {/* The worker's own work: charging the customer, between consuming the event and updating the status */}
                <motion.g
                    variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }}
                    transition={{ duration: 0.6, delay: 0.6 + 3.5 * 0.35, ease }}
                >
                    <rect x="590" y="360" width="120" height="44" fill="#ffffff" stroke={INK} strokeWidth="1.5" />
                    <text x="650" y="379" textAnchor="middle" fontSize="12" fill={MUTED} className="tabular-nums">04</text>
                    <text x="650" y="396" textAnchor="middle" fontSize="14" fill={INK}>charge customer</text>
                </motion.g>
            </motion.svg>
        </figure>
    );
}
