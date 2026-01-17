import { motion, useAnimation, useAnimationFrame, useMotionValue, useTransform, wrap } from "framer-motion";
import { PropsWithChildren, useContext, useEffect, useMemo, useRef, useState } from "react";
import Magnetic from "./magnetic";
import { CursorContext } from "@/app/providers";

const Work = () => {
    const ref = useRef<HTMLDivElement>(null);

    const parentVariants = {
        hover: {
            transition: {
                when: "beforeChildren",
                staggerChildren: 0.3,
                ease: "easeInOut" as const,
            },
        },
        visible: {
            transition: {
                when: "beforeChildren",
                staggerChildren: 0.1,
                ease: "easeInOut" as const,
            },
        },
    };

    return (
        <motion.div ref={ref} className="relative h-screen">
            <motion.div className="absolute w-full h-full top-0 left-0 space-y-4">
                <h1 className="text-3xl lg:text-6xl">
                    Work
                </h1>
                <motion.div
                    variants={parentVariants}
                    className="grid grid-cols-[repeat(1,1fr)] lg:grid-cols-[repeat(3,1fr)] grid-rows-[repeat(3,1fr)] lg:grid-rows-[repeat(2,1fr)] gap-y-[60px] gap-x-[10px]">
                        <WorkItem bgColor="db4c44" idx={2} name="Mesh.Trade" position="Software Engineer (L3)" time="2024-Now">
                        <div className="space-y-3">
                            <div className="space-y-2">
                                <h2 className="text-xl font-semibold">Who did I work for?</h2>
                                <p>
                                    <strong>Mesh.Trade</strong> is a startup looking to bring the future of capital markets using the blockchain.
                                </p>
                            </div>
                            <div className="space-y-2">
                                <h2 className="text-xl font-semibold">What did I do?</h2>
                                <ul className="list-disc ml-4 lg:ml-6 space-y-1 text-sm lg:text-base">
                                    <li>Worked on internal blockchain payment solution and scaled blockchain ledger transaction submission by building a distributed locking service.</li>
                                    <li>Spearheaded gRPC migration</li>
                                    <li>Built and architected a horizontal scaling, self-healing service mesh to allow for dynamic gRPC service registration and discovery using Envoy proxy in a cloud serverless runtime environment.</li>
                                    <li>Performed multiple internal workshops presenting latest research in distributed systems and did an AI visualisation series(here).</li>
                                    <li>Achieved 10x speedup of UI to backend requests by developing middleware to integrate with application-level distributed transaction system and leveraging Redis pub/sub.</li>
                                    <li>Improved to developer productivity by developing code generation tools leveraging custom proto compiler plugin.</li>
                                    <li>Built and architected high-throughput ledger data ingestion pipeline, achieving 5x speedup on previous solution, also helped in providing further business opportunities and better data correctness.</li>
                                </ul>
                            </div>
                        </div>
                    </WorkItem> 
                    <WorkItem bgColor="e8a92c" idx={1} name="Stemey" position="Lead Web Developer" time="2021-2022">
                        <div className="space-y-6">
                            <div>
                                <h2 className="text-2xl font-semibold">Who did I work for?</h2>
                                <p>
                                    <strong>STEMEY</strong>, is a high school led nonprofit organization that aims to inspire the middle and high school students to pursue STEM and to democratize STEM education.
                                </p>
                            </div>
                            <div>
                                <h2 className="text-2xl font-semibold">What did I do?</h2>
                                <ul className="list-disc ml-4 lg:ml-6 space-y-1">
                                    <li>Worked on the marketing website.</li>
                                    <li>Improving website accessibility and responsiveness.</li>
                                    <li>Developed new UI components and improved old designs.</li>
                                </ul>
                            </div>
                        </div>
                    </WorkItem>
                    <WorkItem bgColor="403c37" idx={0} name="Carrus Fleet Management" position="Intern" time="2021-2021">
                        <div className="space-y-3">
                            <div className="space-y-2">
                                <h2 className="text-xl font-semibold">Who did I work for?</h2>
                                <p>
                                    <strong>Carrus Fleet Management</strong> is a fleet management and logistics comapny, which focused on optimising the management and maintenance of vehicle fleets.
                                    The main product developed by the company is an IOT device used to track vehicle data such fuel usage, GPS data and other useful metrics.
                                </p>
                            </div>
                            <div className="space-y-2">
                                <h2 className="text-xl font-semibold">What did I do?</h2>
                                <ul className="list-disc ml-4 lg:ml-6 space-y-3">
                                    <li>Contributed to the development and monitoring of Carrus&apos;s flagship IoT device used to track vehicle metrics such as fuel consumption, GPS location, and operational efficiency.</li>
                                    <li>Analyzed large datasets collected from vehicle telemetry to identify anomalies, inconsistencies, and potential hardware or transmission issues.</li>
                                    <li>Designed and implemented an automated data processing pipeline to clean and validate incoming telemetry data, addressing missing values and malformed records.</li>
                                    <li>Applied statistical techniques to detect outliers in key metrics (e.g., fuel usage, distance traveled), enabling proactive issue resolution with clients.</li>
                                    <li>Helped improve operational reliability by supporting diagnostics of tracker malfunctions and streamlining client feedback workflows.</li>
                                </ul>
                            </div>
                        </div>
                    </WorkItem>
                </motion.div>
            </motion.div>
        </motion.div>
    )
};

interface ParallaxProps {
    children: string;
    baseVelocity: number;
}

function ParallaxText({ children, baseVelocity = 100 }: ParallaxProps) {
    const baseX = useMotionValue(0);

    const x = useTransform(baseX, (v) => `${wrap(-30, 30, v)}%`);

    const directionFactor = useRef<number>(1);
    useAnimationFrame((t, delta) => {
        let moveBy = directionFactor.current * baseVelocity * (delta / 1000);
        moveBy += directionFactor.current * moveBy;

        baseX.set(baseX.get() + moveBy);
    });

    return (
        <div className="parallax">
            <motion.div className="scroller" style={{ x }}>
                <span>{children}</span>
            </motion.div>
        </div>
    );
}

type WorkItemProps = PropsWithChildren<{
    name: string
    position: string
    time: string
    idx: number
    bgColor: string
}>;

const WorkItem = ({ name, position, time, idx, bgColor, children }: WorkItemProps) => {
    const parentVariants = {
        hover: {
            transition: {
                when: "beforeChildren",
                staggerChildren: 0.1,
                ease: "easeInOut" as const,
            },
        },
        visible: {
            transition: {
                when: "beforeChildren",
                staggerChildren: 0.1,
                ease: "easeInOut" as const,
            },
        },
        clicked: {
            transition: {
                when: "beforeChildren",
                staggerChildren: 0.1,
                ease: "easeInOut" as const,
            },
        },
    };

    const topVariants = {
        visible: {
            y: 0,
            transition: {
                ease: "linear" as const,
                duration: 0.6,
            },
        },
        hover: {
            y: -30,
        },
        clicked: {
            opacity: 0,
        },
    }

    const topRiseVariants = {
        visible: {
            y: -50,
        },
        hover: {
            y: 0,
        },
        clicked: {
            opacity: 0,
        },
    }

    const bottomVariants = {
        visible: {
            y: 0,
        },
        hover: {
            y: 100,
            transition: {
                ease: "linear" as const,
                duration: 0.6,
            },
        },
        clicked: {
            opacity: 0,
        },
    }

    const bottomRiseVariant = {
        visible: {
            y: 100,
            transition: {
                ease: "linear" as const,
                duration: 0.4,
            },
        },
        hover: {
            y: -30,
            transition: {
                ease: "linear" as const,
                duration: 0.4,
            },
        },
        clicked: {
            opacity: 0,
        },
    }
    const [showDetail, setShowDetail] = useState(false);

    return (
        <Magnetic>
            <motion.div
                layout
                onClick={() => {
                    setShowDetail(!showDetail);
                }}
                style={{
                    backgroundColor: `#${bgColor}`,
                    top: 0,
                    left: 0,
                    position: showDetail ? "fixed" : undefined,
                    width: showDetail ? "100vw" : "100%",
                    height: showDetail ? "100vh" : "400px",
                    zIndex: showDetail ? 10 : 0,
                }}
                className="row-span-3"
            >
                {!showDetail ?
                    <motion.div
                        initial="visible"
                        animate={showDetail ? "clicked" : "visible"}
                        whileHover={showDetail ? "clicked" : "hover"}
                        variants={parentVariants}
                        className={`text-white p-3 h-full flex flex-col justify-between relative overflow-hidden`}>
                        <motion.div className="flex justify-between text-xs relative">
                            <motion.p variants={topVariants}>{position}</motion.p>
                            <motion.p variants={topVariants}>{time}</motion.p>
                            <motion.p className="text-md absolute" variants={topRiseVariants}>Click to see more!</motion.p>
                        </motion.div>
                        <motion.div className="flex justify-between relative">
                            <motion.p variants={bottomVariants} className="text-xl font-bold">{name}</motion.p>
                            <motion.p variants={bottomVariants} className="text-xl font-bold">0{idx + 1}</motion.p>
                            <motion.div variants={bottomRiseVariant} className="absolute text-7xl font-bold w-[100vw]">
                                <ParallaxText baseVelocity={-5}>{name}</ParallaxText>
                            </motion.div>
                        </motion.div>
                    </motion.div>
                    : <WorkDetail header={name} idx={idx} position={position} time={time} setClicked={setShowDetail}>{children}</WorkDetail>
                }
            </motion.div>
        </Magnetic>
    )
}

type WorkDetailProps = PropsWithChildren<{
    header: string
    position: string
    idx: number
    time: string
    setClicked: any
}>;

const WorkDetail = ({ header, position, idx, time, setClicked, children }: WorkDetailProps) => {
    const [clickedClose] = useState(false);
    const ref = useRef<any>(null);
    const { setHoveredElement, clearHoveredElement } = useContext(CursorContext);
    const containerVariants = {
        visible: {
            transition: {
                when: "beforeChildren",
                staggerChildren: 0.5,
                delayChildren: 0.3,
                ease: "easeInOut" as const,
            },
        },
    };

    const timeVariant = {
        hidden: { opacity: 0, y: -100 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.8,
                ease: "easeInOut" as const,
            },
        },
    }

    const headerVariant = {
        hidden: { opacity: 0, y: 100 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.8,
                ease: "easeInOut" as const,
            },
        },
    };

    const contentVariant = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                duration: 0.9,
                ease: "easeInOut" as const,
                when: "beforeChildren",
                staggerChildren: 0.5,
                delayChildren: 0.3,
            },
        },
    }

    const rightHandSideVariant = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                duration: 0.9,
                ease: "easeInOut" as const,
                staggerChildren: 0.5,
                delayChildren: 0.3,
            },
        },
    }

    const closeVariants = {
        initial: {
            rotate: 0,
        },
        hover: {
            rotate: 90,
        },
    }

    return (
        <motion.div
            ref={ref}
            onClick={(e) => {
                if (!clickedClose) {
                    // prevent click on page from closing it
                    e.stopPropagation();
                }
            }}
            onMouseOver={() => {
                setHoveredElement(ref.current);
            }}
            onMouseLeave={() => {
                clearHoveredElement();
            }}
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="w-full h-full text-white p-3 lg:p-8 relative overflow-y-hidden"
        >
            <motion.div
                variants={timeVariant}
                className="fixed top-0 left-0 w-full p-3"
            >
                <div className="flex justify-between items-center p-1 lg:p-3">
                    <div className="flex items-center space-x-3">
                        <motion.h1 className="text-5xl font-semibold">
                            0{idx + 1}
                        </motion.h1>
                        <motion.h2 className="text-3xl">
                            {position}
                        </motion.h2>
                    </div>
                    <motion.svg onClick={() => setClicked(false)} variants={closeVariants} initial="initial" whileHover="hover" viewBox="0 0 10 10" className="w-[30px] h-[30px]">
                        <motion.path d="M2,8 L5,2 L8,8" className="fill-none stroke-white" style={{ strokeLinecap: "round", strokeLinejoin: "round" }} />
                    </motion.svg>
                </div>
            </motion.div>

            <motion.h1
                className="fixed bottom-5 text-4xl font-semibold lg:text-8xl"
                variants={headerVariant}
            >
                {header}
            </motion.h1>

            <motion.div className="flex flex-col lg:flex-row w-full h-full justify-center items-center">
                <motion.div
                    variants={contentVariant}
                    className="flex flex-col w-full lg:w-1/2 h-full justify-center items-start"
                >
                    {children}
                </motion.div>
            </motion.div>

        </motion.div>
    );
};

export default Work;