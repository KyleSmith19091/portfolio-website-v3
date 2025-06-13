import { frame, useSpring } from "framer-motion";
import { RefObject, useEffect, useState } from "react";

const useFollowPointer = (ref: RefObject<HTMLDivElement | null>, hoveredElement: any) => {
    const [position, setPosition] = useState({ x: 0, y: 0 });

    useEffect(() => {
        if (!ref.current) return

        const handlePointerMove = ({ clientX, clientY }: MouseEvent) => {
            const element = ref.current!

            const x = clientX - element.offsetLeft - element.offsetWidth / 2;
            const y = clientY - element.offsetTop - element.offsetHeight / 2;
            setPosition({ x, y });
        }

        const handleScroll = () => {
            if (hoveredElement) {
                console.log("HANDLE SCROLL!");
                const element = ref.current!;
                setPosition({
                    x: element.getBoundingClientRect().x - element.offsetLeft - element.offsetWidth / 2,
                    y: element.getBoundingClientRect().y - element.offsetTop - element.offsetHeight / 2,
                })
            }
        };
        window.addEventListener("mousemove", handlePointerMove)
        window.addEventListener("scroll", handleScroll);
        return () => {
            window.removeEventListener("mousemove", handlePointerMove)
            window.removeEventListener("scroll", handleScroll);
        }
    }, [])

    return { position };
};

export default useFollowPointer;