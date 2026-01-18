import { motion } from "framer-motion";
import ImageCarousel3D from "./imagecarousel";

const AboutMe = () => {
    const images = ["/images/me1.jpg", "/images/me2.png", "/images/me3.jpg", "/images/me4.jpg", "/images/me5.jpg", "/images/me6.jpg", "/images/me7.jpg"]
    return (
        <div className="space-y-5 h-full">
            <h1 className="text-3xl lg:text-6xl">
                About <span className="text-[#70747d]">Me</span>
            </h1>
            <div>
                <div className="flex flex-col lg:flex-row h-full">
                    <motion.p className="w-full lg:w-1/2">
                        Hi there 👋
                        I&apos;m Kyle, a computer science nerd.
                        Wrote my first piece of software at the age of 12 on a little Raspberry PI. Still remember (after many, many tries) the little PyGame window that popped up to display the time.
                        <br />
                        <br />
                        I then embarked on an epic journey, writing magic 8 balls, rocket simulations, text-based adventure games and broken websites (find here: localhost:8080😂).
                        When I reached high-school, I was introduced to the wonderful world of robotics. This restructured my perception of what is possible with computers and programming.
                        Even though I&apos;ve spent most of my life in the world of software, while watching your program control a physical object (brings a whole new dimension to debugging).
                        My most notable learning was developing a computer vision algorithm for detecting a ball using a phone camera.
                        <br />
                        <br />
                        With this wonderful experience behind me I stepped into University, excited to explore the world that I
                        had on merely scratched the surface of: <strong>Computer Science</strong>. My years at university really
                        allowed me to explore and envelop myself into this new world, allowing me to experiment and learn to my
                        heart&apos;s content. It is also at University where I developed a love for researching and exploring
                        the fundamental problems of Computer Science. I even developed and published my own <a target="#" href="https://link.springer.com/chapter/10.1007/978-3-031-64881-6_13" className="underline font-bold">algorithm</a>.
                        <br />
                        <br />
                        After receiving my bachelor&apos;s degree and honour&apos;s degree I decided to venture into a scary new
                        world: <strong>The Software Industry</strong>.
                    </motion.p>
                    <div className="w-full lg:w-1/2 h-75 lg:h-100">
                        <ImageCarousel3D imageUrls={images} />
                    </div>
                </div>
            </div>
        </div>
    )
};

export default AboutMe;