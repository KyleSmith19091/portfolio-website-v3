import "../../app/globals.css";
import Magnetic from "@/components/magnetic";
import Footer from "@/components/footer";
import Main from "@/pages/(main)/layout";
import Link from "next/link";
import Head from "next/head";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { futura } from "@/lib/fonts";
import { BlogPost, getAllBlogPosts } from "@/lib/blog-metadata";
import Providers from "@/app/providers";
import Cursor, { Reticule } from "@/components/cursor";
import { ease, MaskedTitle, pad, Rule, useFloatingPointer } from "@/components/editorial";

const blogs = getAllBlogPosts();

const dateFormatter = new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
});

const years = blogs.map((blog) => blog.date.getFullYear());
const yearRange = `${Math.min(...years)}–${Math.max(...years)}`;

const Blog = () => {
    const [hovered, setHovered] = useState<number | null>(null);

    const { x, y, rotate, onMouseMove } = useFloatingPointer();

    const preview = hovered !== null ? blogs[hovered] : null;

    return (
        <>
            <Head>
                <title>Blog - Kyle Smith</title>
                <meta name="description" content="Technical blog posts about machine learning, transformers, and software engineering" />
                <meta property="og:title" content="Blog - Kyle Smith" />
                <meta property="og:description" content="Technical blog posts about machine learning, transformers, and software engineering" />
                <meta property="og:type" content="website" />
                <meta property="og:url" content="https://kylesmith.space/blog" />
                <meta property="og:image" content="https://kylesmith.space/blog/induction/gpt2.png" />
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content="Blog - Kyle Smith" />
                <meta name="twitter:description" content="Technical blog posts about machine learning, transformers, and software engineering" />
                <meta name="twitter:image" content="https://kylesmith.space/blog/induction/gpt2.png" />
            </Head>
            <Providers>
                <Reticule />
                <Cursor />
                <div className={futura.className}>
                    <Main>
                        <section className="w-full min-h-screen pt-8 lg:pt-16 pb-24 space-y-16 lg:space-y-24">
                            <Header />

                            <div
                                onMouseMove={onMouseMove}
                                onMouseLeave={() => setHovered(null)}
                            >
                                <motion.div
                                    className="hidden lg:grid grid-cols-[5rem_1fr_10rem] pb-3 text-xs uppercase tracking-[0.2em] text-[#70747d]"
                                    animate={{ opacity: [0, 1] }}
                                    transition={{ duration: 0.8, delay: 1.0 }}
                                >
                                    <span>No.</span>
                                    <span>Title</span>
                                    <span className="text-right">Published</span>
                                </motion.div>
                                <ul>
                                    {blogs.map((blog, i) => (
                                        <Row
                                            key={blog.slug}
                                            blog={blog}
                                            number={blogs.length - i}
                                            index={i}
                                            dimmed={hovered !== null && hovered !== i}
                                            onHover={() => setHovered(i)}
                                        />
                                    ))}
                                </ul>
                                <Rule />
                            </div>
                        </section>
                        <Footer />
                    </Main>
                </div>

                {/* Floating cover preview, desktop only */}
                <motion.div
                    className="hidden lg:block fixed top-0 left-0 z-50 pointer-events-none"
                    style={{ x, y, rotate }}
                >
                    <AnimatePresence>
                        {preview?.ogImage && (
                            <motion.div
                                key={preview.slug}
                                className="absolute -translate-x-1/2 -translate-y-1/2 w-80 aspect-[4/3] bg-[#f2f4f5] overflow-hidden"
                                initial={{ opacity: 0, scale: 0.85, clipPath: "inset(100% 0% 0% 0%)" }}
                                animate={{ opacity: 1, scale: 1, clipPath: "inset(0% 0% 0% 0%)" }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                transition={{ duration: 0.5, ease }}
                            >
                                <Image src={preview.ogImage} alt="" fill sizes="320px" className="object-contain p-4" />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>
            </Providers>
        </>
    );
}

const Header = () => {
    return (
        <header className="space-y-8 lg:space-y-12">
            <MaskedTitle text="Blog" count={blogs.length} />
            <motion.div
                className="flex flex-col lg:flex-row lg:items-end justify-between gap-4"
                animate={{ y: [30, 0], opacity: [0, 1] }}
                transition={{ duration: 0.8, delay: 0.7, ease }}
            >
                <p className="max-w-md text-lg lg:text-2xl">
                    Notes on machine learning, distributed systems and the things I&apos;m building.
                </p>
                <p className="text-xs uppercase tracking-[0.2em] text-[#70747d]">
                    Index · {pad(blogs.length)} entries · {yearRange}
                </p>
            </motion.div>
        </header>
    );
};

type RowProps = {
    blog: BlogPost;
    number: number;
    index: number;
    dimmed: boolean;
    onHover: () => void;
};

const Row = ({ blog, number, index, dimmed, onHover }: RowProps) => {
    // Rows visible on load wait for the header; rows further down reveal as they scroll in
    const delay = index < 5 ? 0.9 + index * 0.06 : 0.1;

    return (
        <motion.li
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-10% 0px" }}
            transition={{ duration: 0.8, delay, ease }}
        >
            <Rule delay={delay} />
            <Magnetic>
                <Link
                    href={`/blog/${blog.slug}`}
                    onMouseEnter={onHover}
                    className="block py-6 lg:py-8"
                >
                    <motion.div
                        className="grid grid-cols-[3rem_1fr] lg:grid-cols-[5rem_1fr_10rem] gap-y-2 items-baseline"
                        animate={{ opacity: dimmed ? 0.2 : 1 }}
                        transition={{ duration: 0.4 }}
                    >
                        <span className="text-sm text-[#70747d] tabular-nums">{pad(number)}</span>
                        <motion.div
                            className="space-y-2"
                            whileHover={{ x: 16 }}
                            transition={{ duration: 0.5, ease }}
                        >
                            <h2 className="text-3xl lg:text-6xl tracking-tight leading-none">{blog.title}</h2>
                            <p className="max-w-xl text-sm lg:text-base text-[#70747d]">{blog.description}</p>
                        </motion.div>
                        <span className="col-start-2 lg:col-start-auto text-sm text-[#70747d] lg:text-right tabular-nums">
                            {dateFormatter.format(blog.date)}
                        </span>
                    </motion.div>
                </Link>
            </Magnetic>
        </motion.li>
    );
};

export default Blog;
