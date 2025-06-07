"use client"

import { CursorContext } from "@/app/providers";
import useFollowPointer from "@/hooks/useFollowPointer";
import { motion, useTransform } from "framer-motion";
import { useContext, useEffect, useRef, useState } from "react";

const Cursor = () => {
    const ref = useRef<HTMLDivElement>(null);
    const {cursorVariant, hoveredElement, setCursorVariant } = useContext(CursorContext);
    const { position } = useFollowPointer(ref, hoveredElement);
    const [clicked, setClicked] = useState(false);

    const width = useTransform(() => {
        if (!hoveredElement) {
            return clicked ? 36 : 40;
        }
        return hoveredElement?.getBoundingClientRect().width + 8;
    });
    const height = useTransform(() => {
        if (!hoveredElement) {
            return clicked ? 36 : 40;
        }
        return hoveredElement?.getBoundingClientRect().height + 8;
    });
    const elX = hoveredElement ? hoveredElement.getBoundingClientRect().left - 4: position.x;
    const elY = hoveredElement ? hoveredElement.getBoundingClientRect().top - 4 : position.y;

    const handleClick = () => {
        setClicked(true);
        if (width.get() === 40) {
            setCursorVariant("clicked");
        }
    };

    const unsetClick = () => {
        setClicked(false);   
        if (width.get() === 36) {
            setCursorVariant("default");
            return;
        }
        setCursorVariant("pointer");
    }

    useEffect(() => {
        document.addEventListener("mousedown", handleClick);
        document.addEventListener("mouseup", unsetClick);

        return () => {
            document.removeEventListener("mousedown", handleClick);
            document.removeEventListener("mouseup", unsetClick);
        }
    }, [])

    const variants = {
        default: { 
            width: 40, 
            height: 40,
            x: elX,
            y: elY, 
            rotate: hoveredElement ? 0 : 45,
            transition: {
                duration: 0.2,
                ease: "linear",
                type: "spring", 
                stiffness: 150, 
                damping: 15, 
                mass: 0.1
            },
        },
        pointer: {
            width: width.get(),
            height: height.get(),
            x: elX,
            y: elY, 
            rotate: 0,
            transition: {
                duration: 0.2,
                ease: "linear",
                type: "spring", 
                stiffness: 200, 
                damping: 15, 
                mass: 0.1
            }
        },
        darkBg: {
            width: width.get(),
            height: height.get(),
            x: elX,
            y: elY, 
            rotate: hoveredElement ? 0 : 45,
            transition: {
                duration: 0.2,
                ease: "linear",
                type: "spring", 
                stiffness: 200, 
                damping: 15, 
                mass: 0.1
            }
        },
        clicked: {
            width: width.get(),
            height: height.get(),
            x: elX,
            y: elY, 
            rotate: 0,
            transition: {
                duration: 0.2,
                ease: "linear",
                type: "spring", 
                stiffness: 200, 
                damping: 15, 
                mass: 0.1
            } 
        }
    };

    return (
        <motion.div ref={ref} className="box-container" animate={cursorVariant} variants={variants}>
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
    const { position } = useFollowPointer(ref, undefined);

    const variants = {
        default: { 
            x: position.x,
            y: position.y, 
            transition: {
                duration: 0.2,
                ease: "linear",
                type: "spring", 
                stiffness: 150, 
                damping: 15, 
                mass: 0.1
            },
        },
        pointer: {
            x: position.x,
            y: position.y, 
            transition: {
                duration: 0.2,
                ease: "linear",
                type: "spring", 
                stiffness: 200, 
                damping: 15, 
                mass: 0.1
            }
        },
        clicked: {
            x: position.x,
            y: position.y, 
            transition: {
                duration: 0.2,
                ease: "linear",
                type: "spring", 
                stiffness: 200, 
                damping: 15, 
                mass: 0.1
            }
        },
        darkBg: {
            x: position.x,
            y: position.y, 
            width: "30px",
            height: "30px",
            transition: {
                duration: 2,
                ease: "linear",
                type: "spring", 
                stiffness: 200, 
                damping: 15, 
                mass: 0.1
            }
        },
    };


    return (
        <motion.div 
            ref={ref} 
            className={`center-dot`} 
            animate={cursorVariant} 
            style={{backgroundColor: cursorVariant == "darkBg" ? "white" : "black"}} 
            variants={variants}
        ></motion.div>
    )
}

export default Cursor;