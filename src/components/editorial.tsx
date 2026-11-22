import { motion, MotionValue, useMotionValue, useSpring, useTransform, useVelocity } from "framer-motion";
import { MouseEvent } from "react";

export const ease = [0.22, 1, 0.36, 1] as const;

export const pad = (n: number) => n.toString().padStart(2, "0");

type MaskedTitleProps = {
    text: string;
    count?: number;
    delay?: number;
    className?: string;
};

// Oversized heading where each letter rises from behind a mask, with an optional muted count beside it.
// The in-view trigger sits on the heading: the letters start clipped by their masks, so they never count as in view themselves.
export const MaskedTitle = ({ text, count, delay = 0.2, className = "text-[28vw] lg:text-[16vw]" }: MaskedTitleProps) => {
    return (
        <motion.h1
            className={`flex items-start leading-[0.8] tracking-tighter font-medium ${className}`}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
        >
            {text.split("").map((letter, i) => (
                // The mask is larger than each letter's box: taller than the tight line height for ascenders and descenders,
                // and wider because tight tracking makes glyphs overhang their advance. Negative margins give the space back.
                <span key={i} className="inline-block overflow-hidden leading-[1.15] pb-[0.1em] -mb-[0.25em] px-[0.15em] -mx-[0.15em]">
                    <motion.span
                        className="inline-block"
                        variants={{ hidden: { y: "110%" }, visible: { y: "0%" } }}
                        transition={{ duration: 1.0, delay: delay + i * 0.08, ease }}
                    >
                        {letter}
                    </motion.span>
                </span>
            ))}
            {count !== undefined && (
                <motion.sup
                    className="text-[4vw] lg:text-[2vw] text-[#70747d] tracking-normal mt-[7vw] lg:mt-[4vw] ml-2"
                    variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }}
                    transition={{ duration: 0.8, delay: delay + 0.6 }}
                >
                    ({pad(count)})
                </motion.sup>
            )}
        </motion.h1>
    );
};

export type FloatingPointer = {
    x: MotionValue<number>;
    y: MotionValue<number>;
    rotate: MotionValue<number>;
    onMouseMove: (e: MouseEvent) => void;
};

// Spring-follows the pointer and tilts with horizontal velocity, for hover previews
export const useFloatingPointer = (): FloatingPointer => {
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);
    const x = useSpring(mouseX, { stiffness: 150, damping: 20, mass: 0.5 });
    const y = useSpring(mouseY, { stiffness: 150, damping: 20, mass: 0.5 });
    const rotate = useTransform(useVelocity(x), [-2000, 2000], [-8, 8], { clamp: true });

    const onMouseMove = (e: MouseEvent) => {
        mouseX.set(e.clientX);
        mouseY.set(e.clientY);
    };

    return { x, y, rotate, onMouseMove };
};

// Horizontal rule that draws in from the left
export const Rule = ({ delay = 0 }: { delay?: number }) => (
    <motion.div
        className="h-px bg-black origin-left"
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1.2, delay, ease }}
    />
);
