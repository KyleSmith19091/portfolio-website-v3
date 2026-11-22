import { AnimatePresence, motion } from "framer-motion";
import { ReactNode, useState } from "react";
import Magnetic from "./magnetic";
import { ease, MaskedTitle, pad, Rule, useFloatingPointer } from "./editorial";

type Job = {
    name: string;
    position: string;
    time: string;
    color: string;
    // Past roles expand to say who the company is and what I did; the current role does not expand
    about?: ReactNode;
    did?: string[];
    current?: boolean;
};

const jobs: Job[] = [
    {
        name: "Aerobotics",
        position: "Software Engineer",
        time: "2026–Now",
        color: "#2e8b57",
        current: true,
    },
    {
        name: "Mesh.Trade",
        position: "Software Engineer (L3)",
        time: "2024–2026",
        color: "#db4c44",
        about: <><strong>Mesh.Trade</strong> is a startup looking to bring the future of capital markets using the blockchain.</>,
        did: [
            "Worked on internal blockchain payment solution and scaled blockchain ledger transaction submission by building a distributed locking service.",
            "Spearheaded gRPC migration",
            "Built and architected a horizontal scaling, self-healing service mesh to allow for dynamic gRPC service registration and discovery using Envoy proxy in a cloud serverless runtime environment.",
            "Performed multiple internal workshops presenting latest research in distributed systems and did an AI visualisation series(here).",
            "Achieved 10x speedup of UI to backend requests by developing middleware to integrate with application-level distributed transaction system and leveraging Redis pub/sub.",
            "Improved to developer productivity by developing code generation tools leveraging custom proto compiler plugin.",
            "Built and architected high-throughput ledger data ingestion pipeline, achieving 5x speedup on previous solution, also helped in providing further business opportunities and better data correctness.",
        ],
    },
    {
        name: "Stemey",
        position: "Lead Web Developer",
        time: "2021–2022",
        color: "#e8a92c",
        about: <><strong>STEMEY</strong>, is a high school led nonprofit organization that aims to inspire the middle and high school students to pursue STEM and to democratize STEM education.</>,
        did: [
            "Worked on the marketing website.",
            "Improving website accessibility and responsiveness.",
            "Developed new UI components and improved old designs.",
        ],
    },
    {
        name: "Carrus Fleet Management",
        position: "Intern",
        time: "2021",
        color: "#403c37",
        about: <><strong>Carrus Fleet Management</strong> is a fleet management and logistics comapny, which focused on optimising the management and maintenance of vehicle fleets. The main product developed by the company is an IOT device used to track vehicle data such fuel usage, GPS data and other useful metrics.</>,
        did: [
            "Contributed to the development and monitoring of Carrus's flagship IoT device used to track vehicle metrics such as fuel consumption, GPS location, and operational efficiency.",
            "Analyzed large datasets collected from vehicle telemetry to identify anomalies, inconsistencies, and potential hardware or transmission issues.",
            "Designed and implemented an automated data processing pipeline to clean and validate incoming telemetry data, addressing missing values and malformed records.",
            "Applied statistical techniques to detect outliers in key metrics (e.g., fuel usage, distance traveled), enabling proactive issue resolution with clients.",
            "Helped improve operational reliability by supporting diagnostics of tracker malfunctions and streamlining client feedback workflows.",
        ],
    },
];

const Work = () => {
    const [hovered, setHovered] = useState<number | null>(null);
    const [open, setOpen] = useState<number | null>(null);
    const { x, y, rotate, onMouseMove } = useFloatingPointer();

    // No preview while a row is open, it would cover the details
    const preview = hovered !== null && open === null ? jobs[hovered] : null;

    return (
        <div className="space-y-16 lg:space-y-24 pb-24">
            <header className="space-y-8 lg:space-y-12">
                <MaskedTitle text="Work" />
                <motion.div
                    className="flex flex-col lg:flex-row lg:items-end justify-between gap-4"
                    initial={{ y: 30, opacity: 0 }}
                    whileInView={{ y: 0, opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, delay: 0.7, ease }}
                >
                    <p className="max-w-md text-lg lg:text-2xl">
                        Distributed systems, data pipelines and the odd website, from fintech to fleet tracking.
                    </p>
                    <p className="text-xs uppercase tracking-[0.2em] text-[#70747d]">
                        Experience · {pad(jobs.length)} roles · 2021–Now
                    </p>
                </motion.div>
            </header>

            <div onMouseMove={onMouseMove} onMouseLeave={() => setHovered(null)}>
                <motion.div
                    className="hidden lg:grid grid-cols-[5rem_1fr_16rem_8rem] pb-3 text-xs uppercase tracking-[0.2em] text-[#70747d]"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, delay: 1.0 }}
                >
                    <span>No.</span>
                    <span>Company</span>
                    <span>Role</span>
                    <span className="text-right">Years</span>
                </motion.div>
                <ul>
                    {jobs.map((job, i) => (
                        <WorkRow
                            key={job.name}
                            job={job}
                            number={jobs.length - i}
                            index={i}
                            isOpen={open === i}
                            dimmed={hovered !== null && hovered !== i && open === null}
                            onHover={() => setHovered(i)}
                            onToggle={() => !job.current && setOpen(open === i ? null : i)}
                        />
                    ))}
                </ul>
                <Rule />
            </div>

            {/* Floating brand-colour card, desktop only */}
            <motion.div
                className="hidden lg:block fixed top-0 left-0 z-50 pointer-events-none"
                style={{ x, y, rotate }}
            >
                <AnimatePresence>
                    {preview && (
                        <motion.div
                            key={preview.name}
                            className="absolute -translate-x-1/2 -translate-y-1/2 w-72 aspect-[4/3] p-4 flex flex-col justify-between text-white"
                            style={{ backgroundColor: preview.color }}
                            initial={{ opacity: 0, scale: 0.85, clipPath: "inset(100% 0% 0% 0%)" }}
                            animate={{ opacity: 1, scale: 1, clipPath: "inset(0% 0% 0% 0%)" }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            transition={{ duration: 0.5, ease }}
                        >
                            <div className="flex justify-between text-xs">
                                <span>{preview.position}</span>
                                <span>{preview.time}</span>
                            </div>
                            <div className="space-y-1">
                                <p className="text-xs opacity-70">{preview.current ? "Where I am now" : "Click to see more"}</p>
                                <p className="text-3xl font-bold leading-none">{preview.name}</p>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </div>
    );
};

type WorkRowProps = {
    job: Job;
    number: number;
    index: number;
    isOpen: boolean;
    dimmed: boolean;
    onHover: () => void;
    onToggle: () => void;
};

const WorkRow = ({ job, number, index, isOpen, dimmed, onHover, onToggle }: WorkRowProps) => {
    const delay = 0.9 + index * 0.06;

    // The current role has nothing to expand, so it is not a button
    const RowTag = job.current ? "div" : "button";
    const rowProps = job.current ? {} : { type: "button" as const, onClick: onToggle, "aria-expanded": isOpen };

    const marker = job.current ? (
        <span className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-black">
            <span className="relative flex w-2 h-2">
                <motion.span
                    className="absolute inset-0 rounded-full"
                    style={{ backgroundColor: job.color }}
                    animate={{ scale: [1, 2.5], opacity: [0.6, 0] }}
                    transition={{ duration: 1.6, repeat: Infinity, ease: "easeOut" }}
                />
                <span className="relative w-2 h-2 rounded-full" style={{ backgroundColor: job.color }} />
            </span>
            Now
        </span>
    ) : (
        <motion.span
            className="text-2xl text-black"
            animate={{ rotate: isOpen ? 45 : 0 }}
            transition={{ duration: 0.4, ease }}
        >
            +
        </motion.span>
    );

    return (
        <motion.li
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-10% 0px" }}
            transition={{ duration: 0.8, delay, ease }}
        >
            <Rule delay={delay} />
            <Magnetic>
                <RowTag
                    {...rowProps}
                    onMouseEnter={onHover}
                    className="block w-full text-left py-6 lg:py-8 cursor-none"
                >
                    <motion.div
                        className="grid grid-cols-[3rem_1fr_auto] lg:grid-cols-[5rem_1fr_16rem_8rem] gap-y-2 items-baseline"
                        animate={{ opacity: dimmed ? 0.2 : 1 }}
                        transition={{ duration: 0.4 }}
                    >
                        <span className="text-sm text-[#70747d] tabular-nums">{pad(number)}</span>
                        <motion.h2
                            className="text-3xl lg:text-6xl tracking-tight leading-none flex items-center gap-4"
                            whileHover={{ x: 16 }}
                            transition={{ duration: 0.5, ease }}
                        >
                            <motion.span
                                className="inline-block w-3 h-3 lg:w-4 lg:h-4 rounded-full shrink-0"
                                style={{ backgroundColor: job.color }}
                                animate={{ scale: isOpen ? 1.4 : 1 }}
                            />
                            {job.name}
                        </motion.h2>
                        <span className="row-start-1 col-start-3 lg:hidden">{marker}</span>
                        <span className="col-start-2 lg:col-start-auto text-sm lg:text-base text-[#70747d]">{job.position}</span>
                        <span className="hidden lg:flex items-center justify-end gap-4 text-sm text-[#70747d] tabular-nums">
                            {job.time}
                            {marker}
                        </span>
                    </motion.div>
                </RowTag>
            </Magnetic>
            <AnimatePresence initial={false}>
                {isOpen && (
                    <motion.div
                        key="detail"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.6, ease }}
                        className="overflow-hidden"
                    >
                        <div className="grid grid-cols-1 lg:grid-cols-[5rem_1fr_1fr] gap-6 lg:gap-12 pb-10">
                            <div className="hidden lg:block w-1 h-full" style={{ backgroundColor: job.color }} />
                            <div className="space-y-2">
                                <h3 className="text-xs uppercase tracking-[0.2em] text-[#70747d]">Who did I work for?</h3>
                                <p className="text-lg lg:text-xl">{job.about}</p>
                                <p className="text-sm text-[#70747d] lg:hidden">{job.time}</p>
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-xs uppercase tracking-[0.2em] text-[#70747d]">What did I do?</h3>
                                <ul className="space-y-3 text-sm lg:text-base">
                                    {job.did?.map((item, j) => (
                                        <motion.li
                                            key={j}
                                            className="grid grid-cols-[2rem_1fr]"
                                            initial={{ opacity: 0, y: 12 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 0.5, delay: 0.2 + j * 0.05, ease }}
                                        >
                                            <span className="text-[#70747d] tabular-nums">{pad(j + 1)}</span>
                                            <span>{item}</span>
                                        </motion.li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.li>
    );
};

export default Work;
