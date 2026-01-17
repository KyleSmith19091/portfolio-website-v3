import { animate, stagger } from "framer-motion"
import { useRef, useEffect } from "react"

const splitText = (heading: HTMLHeadingElement | null) => {
    if (!heading) {
        return [<span></span>];
    } 
    return heading.innerText.split(" ").map((word) => {
        <span>{word}</span>
    });
};

export default function SplitText() {
    const containerRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        document.fonts.ready.then(() => {
            if (!containerRef.current) return

            // Hide the container until the fonts are loaded
            containerRef.current.style.visibility = "visible"

            const words = splitText(
                containerRef.current.querySelector("h1")!
            )

            // Animate the words in the h1
            animate(
                "h1 span",
                { opacity: [0, 1], y: [10, 0] },
                {
                    type: "spring" as const,
                    duration: 2,
                    bounce: 0,
                    delay: stagger(0.05),
                }
            )
        })
    }, [])

    return (
        <div className="container" ref={containerRef}>
            <h1 className="h1">
                Level up your animations with the all-in membership
            </h1>
        </div>
    )
}