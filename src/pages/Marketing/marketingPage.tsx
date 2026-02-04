// src/pages/marketing/MarketingPage.tsx
import { Heading } from "@/components/Marketing/Heading";
import { Heroes } from "@/components/Marketing/Heroes";

const MarketingPage = () => {
    return (
        <div className="min-h-full flex flex-col">
            <div className="flex flex-col items-center justify-center md:justify-start text-center gap-y-8 flex-1 px-6 pb-10 pt-20">
                <Heading />
                <Heroes />
                <div className="hidden md:block">
                    <div className="ocean">
                        <div className="wave"></div>
                        <div className="wave"></div>
                        <div className="wave"></div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default MarketingPage;