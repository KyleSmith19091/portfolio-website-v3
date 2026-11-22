import "../app/globals.css";
import Navbar from "./nav";
import "katex/dist/katex.min.css";
import "@xyflow/react/dist/style.css";
import { useEffect, useRef, useState } from "react";
import { motion, useScroll } from "framer-motion";
import { useRouter } from "next/router";
import Link from "next/link";
import Spinner from "./spinner";
import Head from "next/head";
import Providers from "@/app/providers";
import { futura } from "@/lib/fonts";
import { BlogPost, getAdjacentPosts, getAllBlogPosts, getBlogPost } from "@/lib/blog-metadata";
import Cursor, { Reticule } from "./cursor";
import Footer from "./footer";
import Magnetic from "./magnetic";
import { MDXProvider } from "@mdx-js/react";
import CodeBlock from "./code-block";
import MdxLink from "./mdx-link";
import { ease, pad, Rule } from "./editorial";

const SITE = "https://kylesmith.space";

const WORDS_PER_MINUTE = 230;

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  year: "numeric",
  month: "short",
  day: "numeric",
});

interface MdxLayoutProps {
  children: React.ReactNode;
  meta?: {
    title: string;
    // Headline shown on the page when it differs from the tab / share title
    heading?: string;
    description: string;
    ogImage?: string;
    // Only for posts not yet in blog-metadata.ts; listed posts take their date from there
    date?: string;
    author?: string;
    keywords?: string[];
  };
}

const absolute = (path: string) => (path.startsWith("/") ? `${SITE}${path}` : path);

export default function MdxLayout({ children, meta }: MdxLayoutProps) {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["end end", "start start"],
  });

  // Pages router pathname, e.g. "/blog/lsm-db/day1" -> "lsm-db/day1"
  const slug = useRouter().pathname.replace(/^\/blog\//, "");
  const post = getBlogPost(slug);
  const { previous, next } = getAdjacentPosts(slug);

  const date = post?.date ?? (meta?.date ? new Date(meta.date) : undefined);
  const author = meta?.author ?? post?.author;

  const [minutes, setMinutes] = useState<number | null>(null);
  useEffect(() => {
    const words = ref.current?.innerText.trim().split(/\s+/).length ?? 0;
    setMinutes(Math.max(1, Math.round(words / WORDS_PER_MINUTE)));
  }, []);

  const title = meta?.title || "Blog - Kyle Smith";
  const description =
    meta?.description ||
    "Technical blogs about machine learning and software engineering";
  const ogImage = absolute(meta?.ogImage || "/images/me1.jpg");
  const ogUrl = meta ? `${SITE}/blog/${slug}` : `${SITE}/blog`;

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        {meta?.keywords && (
          <meta name="keywords" content={meta.keywords.join(", ")} />
        )}
        {author && <meta name="author" content={author} />}
        {date && (
          <meta name="article:published_time" content={date.toISOString().slice(0, 10)} />
        )}

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
        <Reticule />
        <Cursor />
        <div className={`${futura.className}`}>
          <MDXProvider components={{ code: CodeBlock, a: MdxLink }}>
            <div className={`container mx-auto px-4`}>
              <Navbar />
              <article
                ref={ref}
                className={[
                  "prose mx-auto max-w-3xl p-3",
                  "[--tw-prose-body:#171717] [--tw-prose-bold:#171717] [--tw-prose-bullets:#70747d] [--tw-prose-counters:#70747d]",
                  "prose-headings:mt-12 prose-headings:font-medium prose-headings:tracking-tight prose-headings:text-black",
                  "prose-h1:text-4xl prose-h2:text-3xl prose-h3:text-2xl prose-h4:text-xl prose-h5:text-lg prose-h6:text-base",
                  "prose-a:text-black prose-a:underline-offset-4 prose-a:decoration-[#c4c7cc] prose-a:transition-colors prose-a:hover:decoration-black",
                ].join(" ")}
              >
                {meta && (
                  <PostHeader
                    heading={meta.heading ?? meta.title}
                    date={date}
                    minutes={minutes}
                    author={author}
                  />
                )}
                {children}
                {/* Zero-height sticky anchor at the END of the article: sticky `bottom`
                    pins it to the viewport bottom while the article's end is below the
                    screen, then it rests at the article's bottom edge (above the footer). */}
                <div className="not-prose sticky bottom-0 z-10 h-0 pointer-events-none">
                  <Spinner
                    progress={scrollYProgress}
                    className="absolute bottom-0 right-0 lg:right-auto lg:left-full lg:ml-2 pointer-events-auto"
                  />
                </div>
              </article>
              {(previous || next) && <PostNav previous={previous} next={next} />}
              <Footer />
            </div>
          </MDXProvider>
        </div>
      </Providers>
    </>
  );
}

type PostHeaderProps = {
  heading: string;
  date?: Date;
  minutes: number | null;
  author?: string;
};

const PostHeader = ({ heading, date, minutes, author }: PostHeaderProps) => {
  const details = [
    date && dateFormatter.format(date),
    minutes && `${minutes} min read`,
    author && `by ${author}`,
  ].filter(Boolean);

  return (
    <header className="not-prose pt-8 lg:pt-16 pb-10 space-y-6">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.2 }}
      >
        <Magnetic>
          <Link href="/blog" className="underline-link text-xs uppercase tracking-[0.2em] text-[#70747d]">
            ← All posts
          </Link>
        </Magnetic>
      </motion.div>
      <div className="overflow-hidden pb-[0.1em]">
        <motion.h1
          className="text-4xl lg:text-6xl font-medium tracking-tight leading-[1.05]"
          initial={{ y: "100%" }}
          animate={{ y: "0%" }}
          transition={{ duration: 1.0, delay: 0.2, ease }}
        >
          {heading}
        </motion.h1>
      </div>
      <motion.p
        className="text-xs uppercase tracking-[0.2em] text-[#70747d] min-h-[1em]"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.6, ease }}
      >
        {details.join(" · ")}
      </motion.p>
      <Rule delay={0.5} />
    </header>
  );
};

type PostNavProps = {
  previous?: BlogPost;
  next?: BlogPost;
};

// Previous / next posts, in the same row style as the blog index
const PostNav = ({ previous, next }: PostNavProps) => {
  const posts = getAllBlogPosts();
  const numberOf = (post: BlogPost) => posts.length - posts.findIndex((p) => p.slug === post.slug);

  const links = [
    previous && { label: "Previous", post: previous },
    next && { label: "Next", post: next },
  ].filter((link): link is { label: string; post: BlogPost } => Boolean(link));

  return (
    <nav className="mx-auto max-w-3xl p-3 pt-16 pb-24">
      <ul>
        {links.map(({ label, post }) => (
          <li key={post.slug}>
            <Rule />
            <Magnetic>
              <Link href={`/blog/${post.slug}`} className="block py-6 lg:py-8">
                <motion.div
                  className="grid grid-cols-[3rem_1fr] gap-y-2 items-baseline"
                  whileHover={{ x: 16 }}
                  transition={{ duration: 0.5, ease }}
                >
                  <span className="text-sm text-[#70747d] tabular-nums">{pad(numberOf(post))}</span>
                  <span className="text-xs uppercase tracking-[0.2em] text-[#70747d]">{label}</span>
                  <h2 className="col-start-2 text-2xl lg:text-4xl tracking-tight leading-none">{post.title}</h2>
                </motion.div>
              </Link>
            </Magnetic>
          </li>
        ))}
      </ul>
      <Rule />
    </nav>
  );
};
