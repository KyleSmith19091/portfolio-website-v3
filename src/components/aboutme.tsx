import { motion } from "framer-motion";
import { ReactNode } from "react";
import ImageCarousel3D from "./imagecarousel";
import Magnetic from "./magnetic";
import { ease, MaskedTitle, pad, Rule } from "./editorial";

const chapters: { label: string; body: ReactNode }[] = [
    {
        label: "Origins",
        body: <>
            Wrote my first piece of software at the age of 12 on a little Raspberry PI. Still remember (after many, many tries) the little PyGame window that popped up to display the time.
        </>,
    },
    {
        label: "Robotics",
        body: <>
            I then embarked on an epic journey, writing magic 8 balls, rocket simulations, text-based adventure games and broken websites (find here: localhost:8080😂).
            When I reached high-school, I was introduced to the wonderful world of robotics. This restructured my perception of what is possible with computers and programming.
            Even though I&apos;ve spent most of my life in the world of software, while watching your program control a physical object (brings a whole new dimension to debugging).
            My most notable learning was developing a computer vision algorithm for detecting a ball using a phone camera.
        </>,
    },
    {
        label: "University",
        body: <>
            With this wonderful experience behind me I stepped into University, excited to explore the world that I
            had on merely scratched the surface of: <strong>Computer Science</strong>. My years at university really
            allowed me to explore and envelop myself into this new world, allowing me to experiment and learn to my
            heart&apos;s content. It is also at University where I developed a love for researching and exploring
            the fundamental problems of Computer Science. I even developed and published my own{" "}
            <Magnetic>
                <a target="#" href="https://link.springer.com/chapter/10.1007/978-3-031-64881-6_13" className="underline-link font-bold">algorithm</a>
            </Magnetic>.
        </>,
    },
    {
        label: "Industry",
        body: <>
            After receiving my bachelor&apos;s degree and honour&apos;s degree I decided to venture into a scary new
            world: <strong>The Software Industry</strong>.
        </>,
    },
];

const AboutMe = () => {
    const images = ["/images/me1.jpg", "/images/me2.png", "/images/me3.jpg", "/images/me4.jpg", "/images/me5.jpg", "/images/me6.jpg", "/images/me7.jpg"]
    return (
        <div className="space-y-16 lg:space-y-24 pb-24">
            <header className="space-y-8 lg:space-y-12">
                <MaskedTitle text="About" />
                <motion.div
                    className="flex flex-col lg:flex-row lg:items-end justify-between gap-4"
                    initial={{ y: 30, opacity: 0 }}
                    whileInView={{ y: 0, opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, delay: 0.7, ease }}
                >
                    <p className="max-w-xl text-2xl lg:text-4xl leading-tight">
                        Hi there 👋 I&apos;m Kyle, a computer science nerd.
                    </p>
                    <p className="text-xs uppercase tracking-[0.2em] text-[#70747d]">
                        Software engineer · South Africa
                    </p>
                </motion.div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
                <ol>
                    {chapters.map((chapter, i) => (
                        <motion.li
                            key={chapter.label}
                            initial={{ opacity: 0, y: 40 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-10% 0px" }}
                            transition={{ duration: 0.8, delay: 0.1, ease }}
                        >
                            <Rule delay={0.1} />
                            <div className="grid grid-cols-[3rem_1fr] lg:grid-cols-[5rem_1fr] py-6 lg:py-8 gap-y-3">
                                <span className="text-sm text-[#70747d] tabular-nums">{pad(i + 1)}</span>
                                <h2 className="text-xs uppercase tracking-[0.2em] text-[#70747d] self-center">{chapter.label}</h2>
                                <p className="col-start-2 text-base lg:text-lg leading-relaxed">{chapter.body}</p>
                            </div>
                        </motion.li>
                    ))}
                    <Rule />
                </ol>

                {/* Leads on mobile; stays in view beside the chapters on desktop */}
                <motion.div
                    className="order-first lg:order-none w-full h-75 lg:h-[28rem] lg:sticky lg:top-24 self-start"
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 1.0, delay: 0.3, ease }}
                >
                    <ImageCarousel3D imageUrls={images} />
                </motion.div>
            </div>
        </div>
    )
};

export default AboutMe;
