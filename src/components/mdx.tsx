import "../app/globals.css";
import Navbar from "./nav";
import 'katex/dist/katex.min.css';
import '@xyflow/react/dist/style.css';
import RootLayout from "@/app/layout";
import { useRef } from "react";
import { useScroll } from "framer-motion";
import Spinner from "./spinner";

export default function MdxLayout({ children }: { children: React.ReactNode }) {
    const ref = useRef(null);
    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ["end end", "start start"],
    });

    return (
        <RootLayout>
            <div className="container mx-auto">
                <Navbar />
                <article ref={ref} className="prose prose-headings:mt-8 prose-headings:font-semibold prose-headings:text-black prose-h1:text-5xl prose-h2:text-4xl prose-h3:text-3xl prose-h4:text-2xl prose-h5:text-xl prose-h6:text-lg dark:prose-headings:text-white w-full mx-auto p-3">
                    <Spinner progress={scrollYProgress} className="fixed bottom-0 right-0"/>
                    {children}
                </article>
            </div>
        </RootLayout>
    )
}