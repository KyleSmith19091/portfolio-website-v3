"use client"
import Navbar from "../../components/nav";

const Main = ({ children }: Readonly<{
    children: React.ReactNode;
}>) => {
    return (
        <div className="container mx-auto px-4 min-h-screen h-full">
            <Navbar />
            <main className="h-full">
                {children}
            </main>
        </div>
    )
}

export default Main;