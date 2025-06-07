"use client"

import { CursorContext } from "@/app/providers";
import { Canvas, useFrame } from "@react-three/fiber";
import { motion } from "framer-motion";
import Link from "next/link";
import { useContext, useRef } from "react";
import { Mesh } from "three";
import Magnetic from "./magnetic";

const Hero = () => {
    const cameraSettings = {
        fov: 45,
        zoom: 100,
        near: 0.1,
        far: 200,
        position: [3, 2, 6]
    };
    return (
        <div className="w-full h-screen">
            <motion.div transition={{ duration: 1.2, delay: 0.7 }} animate={{ y: [100, 0], opacity: [0.0, 1.0] }} className="w-full h-[70%]">
                <Canvas
                    orthographic
                    camera={cameraSettings}
                    className="w-full h-full"
                >
                    <Scene />
                </Canvas>
            </motion.div>
            <motion.div transition={{ duration: 1.2, delay: 1.2 }} animate={{ y: [120, 0], opacity: [0.0, 1.0] }} className="flex justify-center w-full mb-4 lg:mb-14 text-sm lg:text-base">
                <p>Hi 🌊, my name is Kyle, a software engineer and (unofficial) researcher, based in South Africa.</p>
            </motion.div>
            <motion.div className="flex flex-col items-center justify-center space-y-5" transition={{ duration: 0.8, delay: 1.8 }} animate={{ y: [100, 0], opacity: [0.0, 1.0] }}>
                <motion.div className="w-2 h-2 bg-black rounded-full" initial={{ y: 0 }} animate={{ y: [0.0, 10, 0.0] }} transition={{ repeat: Infinity }} />
                <Magnetic>
                <Link href="#aboutme">
                    Scroll Down
                </Link>
                </Magnetic>
            </motion.div>
        </div>
    );
}

const Scene = () => {
    const objectRef = useRef<Mesh>(null);
    const radius = 1.5;

    useFrame(() => {
        if (objectRef.current) {
            objectRef.current.rotation.y += 0.005;
        }
    })
    return (
        <mesh ref={objectRef}>
            <sphereGeometry args={[radius, 32, 32]} />
            <meshBasicMaterial color="black" wireframe />
        </mesh>
    );
};

export default Hero;