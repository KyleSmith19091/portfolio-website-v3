import "../app/globals.css";
import Navbar from "./nav";
import 'katex/dist/katex.min.css';
import '@xyflow/react/dist/style.css';
import { useRef } from "react";
import { useScroll } from "framer-motion";
import Spinner from "./spinner";
import Head from "next/head";
import Providers from "@/app/providers";
import { futura } from "@/lib/fonts";
import Cursor, { Reticule } from "./cursor";
import Footer from "./footer";

interface MdxLayoutProps {
    children: React.ReactNode;
    meta?: {
        title: string;
        description: string;
        ogImage?: string;
        date?: string;
        author?: string;
        keywords?: string[];
    };
}

export default function MdxLayout({ children, meta }: MdxLayoutProps) {
    const ref = useRef(null);
    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ["end end", "start start"],
    });

    const title = meta?.title || "Blog - Kyle Smith";
    const description = meta?.description || "Technical blogs about machine learning and software engineering";
    const ogImage = meta?.ogImage || "https://kylesmith.space/images/me1.jpg";
    const ogUrl = meta?.title
        ? `https://kylesmith.space/blog/${meta.title.toLowerCase().replace(/\s+/g, "-")}`
        : "https://kylesmith.space/blog";

    return (
        <>
            <Head>
                <title>{title}</title>
                <meta name="description" content={description} />
                {meta?.keywords && <meta name="keywords" content={meta.keywords.join(", ")} />}
                {meta?.author && <meta name="author" content={meta.author} />}
                {meta?.date && <meta name="article:published_time" content={meta.date} />}

                <meta property="og:title" content={title} />
                <meta property="og:description" content={description} />
                <meta property="og:type" content={meta ? "article" : "website"} />
                <meta property="og:url" content={ogUrl} />
                <meta property="og:image" content={ogImage} />
                <meta property="og:site_name" content="Kyle Smith Portfolio" />

                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content={title} />
                <meta name="twitter:description" content={description} />
                <meta name="twitter:image" content={ogImage} />
            </Head>
            <Providers>
                <Reticule/>
                <Cursor/>
                <div className={`container mx-auto ${futura.className}`}>
                    <Navbar />
                    <article ref={ref} className="prose prose-headings:mt-8 prose-headings:font-semibold prose-headings:text-black prose-h1:text-5xl prose-h2:text-4xl prose-h3:text-3xl prose-h4:text-2xl prose-h5:text-xl prose-h6:text-lg w-full mx-auto p-3">
                        <Spinner progress={scrollYProgress} className="fixed bottom-0 right-0" />
                        {children}
                    </article>
                    <Footer />
                </div>
            </Providers>
        </>
    )
}