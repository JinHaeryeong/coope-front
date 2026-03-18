import { Suspense, lazy } from "react";
import { Loader2 } from "lucide-react";

const InquiryDetailContent = lazy(() => import("@/features/inquiry/components/InquiryDetailContent"));

const InquiryDetailPage = () => {
    return (
        <Suspense fallback={
            <div className="h-screen w-full flex flex-col items-center justify-center gap-4">
                <Loader2 className="w-12 h-12 animate-spin text-blue-500" />
                <p className="text-slate-500 animate-pulse">페이지를 준비 중...</p>
            </div>
        }>
            <InquiryDetailContent />
        </Suspense>
    );
};

export default InquiryDetailPage;
