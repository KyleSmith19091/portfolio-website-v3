"use client"

import AboutMe from "@/components/aboutme";
import Hero from "@/components/hero";
import Magnetic from "@/components/magnetic";
import Work from "@/components/work";
import Main from "@/pages/(main)/layout";
import { motion, useTransform, useScroll as useFramerScroll } from "framer-motion";
import Link from "next/link";

export const Home = () => {
  const { scrollYProgress } = useFramerScroll();
  const opacity = useTransform(() => 0.9 - scrollYProgress.get());
  const yProgress = useTransform(() => 0 - scrollYProgress.get() * 10);
  return (
    <Main>
      <motion.div className="w-full h-full space-y-5">
        <motion.section className="w-full h-full" style={{ opacity: opacity, y: yProgress }}>
          <Hero />
        </motion.section>

        <motion.hr initial={{width: 0, height: "3px"}} whileInView={{width: "100%"}} transition={{duration:0.8}}/>

        <motion.section whileInView={{ y: [100, 0], opacity: [0.0, 1.0] }} transition={{ duration: 0.8, delay: 0.2 }} id="aboutme" className="w-full min-h-screen space-y-8">
          <AboutMe />
        </motion.section>

        <motion.hr initial={{width: 0, height: "3px"}} whileInView={{width: "100%"}} transition={{duration:0.8}}/>

        <motion.section whileInView={{ y: [100, 0], opacity: [0.0, 1.0] }} transition={{ duration: 0.8, delay: 0.2 }} id="work" className="w-full h-screen space-y-8">
          <Work />
        </motion.section>

        <motion.section whileInView={{ y: [100, 0], opacity: [0.0, 1.0] }} transition={{ duration: 0.8, delay: 0.2 }} id="work" className="w-full h-screen space-y-8">
          <div className="flex flex-col items-center justify-center h-full">
            <h1 className="text-4xl">Thank you for visiting!</h1>
            <ul className="flex items-center space-x-3">
              <li>
                <Magnetic>
                  <Link href="https://github.com/KyleSmith19091" className="underline-link" target="_blank">
                    Github
                  </Link>
                </Magnetic>
              </li>
              <li>
                <Magnetic>
                  <Link href="https://www.linkedin.com/in/kyle-s-008636162/" className="underline-link" target="_blank">
                    LinkedIn
                  </Link>
                </Magnetic>
              </li>
            </ul>
          </div>
        </motion.section>
      </motion.div>
    </Main>
  );
}



export default Home;




