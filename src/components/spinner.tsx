import { MotionValue, motion, useScroll, useTransform } from "framer-motion";
import Magnetic from "./magnetic";

type SpinnerProps = {
    progress: MotionValue<number>;
    className: string;
};

const Spinner = ({ progress, className }: SpinnerProps) => {
    const color = useTransform(() => {
        if (progress.get() === 0) {
            return "#e8a92c";
        }
        return "black";
    });
    return (
        <div className={className} onClick={() => {
            window.scrollTo({
                top: 0,
                behavior: "smooth"
            })
        }}>
            <Magnetic>
                <motion.svg
                    width="75"
                    height="75"
                    viewBox="0 0 100 100"
                    className={"stroke-[5] stroke-dashoffset-[0] fill-none transition-colors ease-in-out"}
                    style={{
                        stroke: color,
                    }}
                >
                    <circle
                        cx="50"
                        cy="50"
                        r="30"
                        pathLength="1"
                        className="opacity-[0.4]"
                    />
                    <motion.circle
                        cx="50"
                        cy="50"
                        r="30"
                        pathLength="0"
                        className="stroke-[5] stroke-dashoffset-[0] fill-none"
                        style={{
                            pathLength: progress,
                        }}
                    />
                </motion.svg>
            </Magnetic>
        </div>
    )
}

export default Spinner;