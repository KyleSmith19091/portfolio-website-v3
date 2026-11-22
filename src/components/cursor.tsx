"use client"

import { CursorContext } from "@/app/providers";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { RefObject, useContext, useEffect, useRef } from "react";

const BOX_SPRING = { stiffness: 150, damping: 15, mass: 0.1 };
const DOT_SPRING = { stiffness: 150, damping: 15, mass: 0.1 };

// Hides the element until the first real pointer event, so it never
// flashes at (0, 0) on load.
const markReady = (ref: RefObject<HTMLElement | null>) => {
    if (ref.current) ref.current.dataset.ready = "true";
};

const Cursor = () => {
    const ref = useRef<HTMLDivElement>(null);
    const { hoveredElement, setCursorVariant } = useContext(CursorContext);

    // Everything is driven by motion values: no React re-render per mouse move.
    const x = useSpring(0, BOX_SPRING);
    const y = useSpring(0, BOX_SPRING);
    const width = useSpring(40, BOX_SPRING);
    const height = useSpring(40, BOX_SPRING);
    const rotate = useSpring(45, BOX_SPRING);

    const pointer = useRef<{ x: number; y: number } | null>(null);
    const clicked = useRef(false);
    const hovered = useRef<HTMLElement | null>(null);
    const seen = useRef(false);
    const raf = useRef(0);

    const apply = (jump: boolean) => {
        const el = hovered.current;
        let tx: number, ty: number, tw: number, th: number, tr: number;
        if (el) {
            const r = el.getBoundingClientRect();
            tx = r.left - 4;
            ty = r.top - 4;
            tw = r.width + 8;
            th = r.height + 8;
            tr = 0;
        } else {
            if (!pointer.current) return;
            tw = th = clicked.current ? 36 : 40;
            tx = pointer.current.x - tw / 2;
            ty = pointer.current.y - th / 2;
            tr = 45;
        }
        const set = (mv: typeof x, v: number) => (jump ? mv.jump(v) : mv.set(v));
        set(x, tx); set(y, ty); set(width, tw); set(height, th); set(rotate, tr);
    };

    const schedule = () => {
        if (raf.current) return;
        raf.current = requestAnimationFrame(() => {
            raf.current = 0;
            apply(false);
        });
    };

    // Hovered element changes
    useEffect(() => {
        hovered.current = hoveredElement;
        // If we have never seen the pointer but an element is hovered, snap to it.
        const first = !seen.current && !!hoveredElement;
        if (first) { seen.current = true; markReady(ref); }
        apply(first);
    }, [hoveredElement]);

    useEffect(() => {
        const onMove = (e: MouseEvent) => {
            pointer.current = { x: e.clientX, y: e.clientY };
            if (!seen.current) {
                seen.current = true;
                apply(true);
                markReady(ref);
                return;
            }
            // Only follow the pointer while not locked onto an element.
            if (!hovered.current) schedule();
        };
        const onScrollResize = () => { if (hovered.current) schedule(); };
        const onDown = () => {
            clicked.current = true;
            if (!hovered.current) setCursorVariant("clicked");
            schedule();
        };
        const onUp = () => {
            clicked.current = false;
            setCursorVariant(hovered.current ? "pointer" : "default");
            schedule();
        };

        window.addEventListener("mousemove", onMove, { passive: true });
        window.addEventListener("scroll", onScrollResize, { passive: true, capture: true });
        window.addEventListener("resize", onScrollResize, { passive: true });
        document.addEventListener("mousedown", onDown);
        document.addEventListener("mouseup", onUp);
        return () => {
            window.removeEventListener("mousemove", onMove);
            window.removeEventListener("scroll", onScrollResize, true);
            window.removeEventListener("resize", onScrollResize);
            document.removeEventListener("mousedown", onDown);
            document.removeEventListener("mouseup", onUp);
            cancelAnimationFrame(raf.current);
            raf.current = 0;
        };
    }, []);

    return (
        <motion.div
            ref={ref}
            className="box-container"
            data-ready="false"
            style={{ x, y, width, height, rotate }}
        >
            <motion.div className="corner top-left"></motion.div>
            <motion.div className="corner top-right"></motion.div>
            <motion.div className="corner bottom-left"></motion.div>
            <motion.div className="corner bottom-right"></motion.div>
        </motion.div>
    );
};

export const Reticule = () => {
    const ref = useRef<HTMLDivElement>(null);
    const { cursorVariant } = useContext(CursorContext);
    const x = useSpring(0, DOT_SPRING);
    const y = useSpring(0, DOT_SPRING);
    const seen = useRef(false);

    useEffect(() => {
        const onMove = (e: MouseEvent) => {
            const tx = e.clientX;
            const ty = e.clientY;
            if (!seen.current) {
                seen.current = true;
                x.jump(tx); y.jump(ty);
                markReady(ref);
                return;
            }
            x.set(tx); y.set(ty);
        };
        window.addEventListener("mousemove", onMove, { passive: true });
        return () => window.removeEventListener("mousemove", onMove);
    }, []);

    const dark = cursorVariant === "darkBg";

    return (
        <motion.div
            ref={ref}
            className="center-dot"
            data-ready="false"
            animate={{ width: dark ? 30 : 5, height: dark ? 30 : 5, marginLeft: dark ? -15 : -2.5, marginTop: dark ? -15 : -2.5, backgroundColor: dark ? "#ffffff" : "#000000" }}
            style={{ x, y }}
        ></motion.div>
    );
};

export default Cursor;
