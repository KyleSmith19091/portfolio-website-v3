"use client"

import { useRef, useState } from "react";
import Magnetic from "@/components/magnetic";
import useFollowPointer from "@/hooks/useFollowPointer";
import { motion } from "framer-motion";

type AttentionProps = {
    score: number[][];
    tokens: string[];
};

const Attention = ({ score, tokens }: AttentionProps) => {
    const [hoverTokens, setHoverTokens] = useState({
        left: "",
        bottom: "",
    });
    const ref = useRef(null);
    const { position } = useFollowPointer(ref, undefined);

    if (!score || score.length === 0 || !tokens) {
        return null;
    }

    return (
        <div
            className="flex flex-col relative"
        >
            {
                score.map((score, idx) => {
                    return (
                        <Row
                            key={idx}
                            row={idx}
                            scores={score}
                            tokens={tokens}
                            setHoverTokens={setHoverTokens}
                        />
                    );
                })
            }
            <motion.div
                className="fixed bg-black text-white p-3"
                ref={ref}
                animate={{
                    x: position.x + 30,
                    y: position.y + 30,
                }}
                style={{
                    opacity: hoverTokens.left === "" ? 0 : 1,
                }}
            >
                {hoverTokens.left} - {hoverTokens.bottom}
            </motion.div>
        </div>
    )
};

type RowProps = {
    row: number;
    scores: number[];
    tokens: string[];
    setHoverTokens: any;
};

const Row = ({ row, tokens, scores, setHoverTokens }: RowProps) => {
    return (
        <div className="flex gap-[0.5px] space-y-[0.5px]">
            {
                scores.map((score, idx) => {
                    return (
                        <div
                            key={idx}
                            onMouseOver={() => {
                                if (score !== 0) {
                                    setHoverTokens({
                                        left: tokens[row],
                                        bottom: tokens[idx],
                                    });
                                } else {
                                    setHoverTokens({
                                        left: "",
                                        bottom: "",
                                    });
                                }
                            }}
                            onMouseLeave={() => {
                                setHoverTokens({
                                    left: "",
                                    bottom: "",
                                });
                            }}
                            className="w-[10px] h-[10px]"
                            style={{
                                backgroundColor: ((): string => {
                                    const color = intensity(
                                        {
                                            red: 255,
                                            green: 255,
                                            blue: 255,
                                        } as RGB,
                                        {
                                            red: 255,
                                            green: 0,
                                            blue: 0,
                                        } as RGB,
                                        score
                                    );
                                    return `rgb(${color.red}, ${color.green}, ${color.blue})`
                                })(),
                            }}
                        >
                        </div>
                    )
                })
            }
        </div>
    );
};

type RGB = {
    red: number;
    green: number;
    blue: number;
};

const intensity = (color1: RGB, color2: RGB, t: number) => {
    t = Math.max(0, Math.min(1, t)); // clamp t
    return {
        red: Math.round(color1.red + (color2.red - color1.red) * t),
        green: Math.round(color1.green + (color2.green - color1.green) * t),
        blue: Math.round(color1.blue + (color2.blue - color1.blue) * t),
    };
};

/*
W_Q = 768 x 768
Q = X * Q (batch * sequence length * emb) * (emb * emb) = (batch * sequence length * emb)
*/

export default Attention;