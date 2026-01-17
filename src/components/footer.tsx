import Link from "next/link";
import Magnetic from "./magnetic";

const Footer = () => {
    return (
        <div className="flex items-center justify-between h-full border-t py-6 border-[#f5f5f5] min-h-75">
            <div className="flex flex-col items-start">
                <h1 className="text-4xl">Thank you for visiting!</h1>
                <ul className="flex items-center space-x-3 text-[#70747d]">
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
            <div className="text-[#70747d]">
                Copyright © 2026 Kyle Smith.
            </div>
        </div>
    );
};

export default Footer;