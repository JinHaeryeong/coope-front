import { Suspense, lazy } from "react";
import { Loader2 } from "lucide-react";

const CommunityList = lazy(() => import("@/features/community/components/CommunityList"));

const CommunityPage = () => {
    return (
        <div className="container mx-auto py-10 px-4 md:px-6">
            <Suspense
                fallback={
                    <div className="h-[60vh] w-full flex flex-col items-center justify-center gap-4">
                        <Loader2 className="w-12 h-12 animate-spin text-primary" />
                        <p className="text-muted-foreground animate-pulse">커뮤니티를 불러오는 중...</p>
                    </div>
                }
            >
                <CommunityList />
            </Suspense>
        </div>
    );
};

export default CommunityPage;