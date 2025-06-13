"use client"

import AboutMe from "@/components/aboutme";
import Footer from "@/components/footer";
import Hero from "@/components/hero";
import Magnetic from "@/components/magnetic";
import Work from "@/components/work";
import Main from "@/pages/(main)/layout";
import { motion, useTransform, useScroll as useFramerScroll } from "framer-motion";
import Link from "next/link";

const Page = () => {
  const { scrollYProgress } = useFramerScroll();
  const opacity = useTransform(() => 0.9 - scrollYProgress.get());
  const yProgress = useTransform(() => 0 - scrollYProgress.get() * 10);
  return (
    <Main>
      <motion.div className="w-full h-full space-y-5">
        <motion.section className="w-full h-full" style={{ opacity: opacity, y: yProgress }}>
          <Hero />
        </motion.section>

        <motion.section whileInView={{ y: [100, 0], opacity: [0.0, 1.0] }} transition={{ duration: 0.8, delay: 0.2 }} id="aboutme" className="w-full min-h-screen space-y-8">
          <AboutMe />
        </motion.section>

        <motion.section whileInView={{ y: [100, 0], opacity: [0.0, 1.0] }} transition={{ duration: 0.8, delay: 0.2 }} id="work" className="w-full min-h-full space-y-8">
          <Work />
        </motion.section>

        <motion.section whileInView={{ y: [100, 0], opacity: [0.0, 1.0] }} transition={{ duration: 0.8, delay: 0.2 }} id="footer" className="w-full h-full space-y-8">
          <Footer />
        </motion.section>

      </motion.div>
    </Main>
  );
}



export default Page;




