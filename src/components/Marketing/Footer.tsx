import { useState, Suspense, lazy } from "react";
import { useLocation } from "react-router-dom"; // next/navigation 대신 사용

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Vite/React에서는 lazy와 Suspense를 사용하여 다이나믹 임포트를 구현합니다.
const DynamicPolicy = lazy(() => import("./Policy"));
const DynamicTerms = lazy(() => import("./Term"));
const DynamicModal = lazy(() => import("./Modal"));

export const Footer = () => {
    // pathname을 가져오기 위해 react-router-dom의 useLocation 사용
    const { pathname } = useLocation();
    const [isTermsModalOpen, setIsTermsModalOpen] = useState(false);
    const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false);

    // 메인 페이지(/) 여부 파악
    const isMainPage = pathname === "/";

    const openTermsModal = () => setIsTermsModalOpen(true);
    const closeTermsModal = () => setIsTermsModalOpen(false);
    const openPrivacyModal = () => setIsPrivacyModalOpen(true);
    const closePrivacyModal = () => setIsPrivacyModalOpen(false);

    return (
        <div className={cn(
            "flex items-center w-full p-3 bg-background dark:bg-[#1F1F1F] rounded-t-2xl",
            isMainPage ? "fixed bottom-0" : "relative mt-auto"
        )}>
            <div className="md:ml-auto w-full justify-between md:justify-end flex items-center gap-x-2 text-muted-foreground">
                <Button variant="ghost" size="sm" onClick={openPrivacyModal}>
                    개인정보정책
                </Button>


                <Button variant="ghost" size="sm" onClick={openTermsModal}>
                    이용약관
                </Button>

                {/* lazy 컴포넌트는 반드시 Suspense로 감싸줘야 합니다. */}
                <Suspense fallback={null}>
                    {isPrivacyModalOpen && (
                        <DynamicModal isOpen={isPrivacyModalOpen} onClose={closePrivacyModal} title="개인정보 정책">
                            <DynamicPolicy />
                        </DynamicModal>
                    )}



                    {isTermsModalOpen && (
                        <DynamicModal isOpen={isTermsModalOpen} onClose={closeTermsModal} title="이용약관">
                            <DynamicTerms />
                        </DynamicModal>
                    )}
                </Suspense>
            </div>
        </div>
    )
}