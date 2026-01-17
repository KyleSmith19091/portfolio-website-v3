import "../../app/globals.css";
import Magnetic from "@/components/magnetic";
import Navbar from "@/components/nav";
import Link from "next/link";
import Head from "next/head";
import { futura } from "@/lib/fonts";
import { getAllBlogPosts } from "@/lib/blog-metadata";
import Providers from "@/app/providers";
import Cursor, { Reticule } from "@/components/cursor";

const blogs = getAllBlogPosts();

const Blog = () => {
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
                <Reticule/>
                <Cursor/>
                <div className={`container mx-auto space-y-6 ${futura.className}`}>
                    <Navbar />
                    <h1 className="text-5xl lg:text-7xl text-center">Personal Blog</h1>
                    <div className="grid grid-cols-[repeat(1,1fr)] lg:grid-cols-[repeat(3,1fr)] gap-x-3 gap-y-3">
                        {blogs.map((blog) => {
                            const formattedDate = new Intl.DateTimeFormat("en-US", {
                                year: "numeric",
                                month: "2-digit",
                                day: "2-digit",
                            }).format(blog.date);
                            return (
                                <Link key={blog.slug} href={`/blog/${blog.slug}`}>
                                    <Magnetic>
                                        <div className="bg-[#f2f4f5] p-3 relative space-y-4">
                                            <div>
                                                <h2 className="text-3xl">{blog.title}</h2>
                                                <p className="text-sm text-[#70747d]">{formattedDate}</p>
                                            </div>
                                            <p className="text-[#70747d]">{blog.description}</p>
                                        </div>
                                    </Magnetic>
                                </Link>
                            )
                        })}
                    </div>
                </div>
            </Providers>
        </>
    );
}

export default Blog;