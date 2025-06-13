import "../../app/globals.css";
import RootLayout from "@/app/layout";
import Magnetic from "@/components/magnetic";
import Navbar from "@/components/nav";
import Link from "next/link";

const blogs = [
    {
        name: "Induction Circuits",
        path: "/induction",
        description: "Ever wonder how LLMs discover context? Well they use induction.",
        date: new Date("2025-05-05")
    },
];

const Blog = () => {
    return (
        <RootLayout>
            <div className="container mx-auto space-y-6">
                <Navbar />
                <h1 className="text-5xl lg:text-7xl text-center">Personal Blog</h1>
                <div className="grid grid-cols-[repeat(1,1fr)] lg:grid-cols-[repeat(3,1fr)] gap-x-3 gap-y-3">
                    {blogs.map((blog) => {
                        return (
                            <Link key={blog.name} href={`blog/${blog.path}`}>
                                <Magnetic>
                                    <div className="bg-[#f2f4f5] p-3 relative space-y-4">
                                        <div>
                                            <h2 className="text-3xl">{blog.name}</h2>
                                            <p className="text-sm text-[#70747d]">{blog.date.getFullYear()}/{blog.date.getMonth()}/{blog.date.getDay()}</p>
                                        </div>
                                        <p className="text-[#70747d]">{blog.description}</p>
                                    </div>
                                </Magnetic>
                            </Link>
                        )
                    })}
                </div>
            </div>
        </RootLayout>
    );
}

export default Blog;