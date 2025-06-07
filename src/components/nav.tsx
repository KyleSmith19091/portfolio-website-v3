"use client"

import { motion } from "framer-motion";
import Link from "next/link";
import Magnetic from "./magnetic";
import { useEffect, useState } from "react";

const Navbar = () => {
    const homePages = [
        {
            content: "about me",
            path: "#aboutme",
        },
        {
            content: "work",
            path: "#work",
        },
        {
            content: "blog",
            path: "/blog/induction"
        },
    ];

    const [pages, setPages] = useState(homePages);

    useEffect(() => {
        console.log(window.location.pathname);
        if (window.location.pathname.indexOf("/blog") !== -1) {
            setPages([]);
        }
    }, [])

    return (

        <motion.nav transition={{ duration: 0.5, }} animate={{y: [-100, 1.0] }} className="p-3 top-0.5 flex items-center justify-between">
            {/* Left */}
            <div className="left text-2xl">
                <Magnetic>
                    <Link href="/" className="flex items-center space-x-3">
                        <svg id="reversek" width="23" height="25" viewBox="0 0 41 43" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M38.28 42.2L20.616 24.536L3.272 41.688L0.328 38.296L17.288 21.208L0.264 4.184L3.272 0.855999L20.552 18.008L38.28 0.343998L40.776 1.24V41.304L38.28 42.2ZM36.232 33.688V8.92L23.816 21.208L36.232 33.688Z"  />
                        </svg>
                        <span>Kyle S.</span>
                    </Link>
                </Magnetic>
            </div>

            {/* Right */}
            <div className="space-x-5">
                {pages.map((page, index) => (
                    <Magnetic key={index}>
                        <Link href={page.path} className="underline-link">
                            {page.content}
                        </Link>
                    </Magnetic>
                ))}
            </div>
        </motion.nav>
    )
};

export default Navbar;