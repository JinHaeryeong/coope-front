import { Outlet } from "react-router-dom";
import { Navbar } from "@/components/Marketing/Navbar";
import { Footer } from "@/components/Marketing/Footer";

export const MarketingLayout = () => {
    return (
        <div className="min-h-screen dark:bg-[#1F1F1F] flex flex-col">
            <Navbar />
            <main className="flex-1 flex flex-col">
                <Outlet />
            </main>
            <Footer />
        </div>
    );
};