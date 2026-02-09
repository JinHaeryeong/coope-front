import { useState, Suspense, lazy } from "react";
import { useLocation } from "react-router-dom"; // next/navigation 대신 사용

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useTermsModal } from "@/hooks/useTermsModal";
import { usePrivacyModal } from "@/hooks/usePrivacyModal";


export const Footer = () => {
    const { pathname } = useLocation();
    const termsModal = useTermsModal();
    const privacyModal = usePrivacyModal();

    const isMainPage = pathname === "/";


    return (
        <div className={cn(
            "flex items-center w-full p-3 bg-background dark:bg-[#1F1F1F] rounded-t-2xl",
            isMainPage ? "fixed bottom-0" : "relative mt-auto"
        )}>
            <div className="md:ml-auto w-full justify-between md:justify-end flex items-center gap-x-2 text-muted-foreground">
                <Button variant="ghost" size="sm" onClick={privacyModal.onOpen}>
                    개인정보정책
                </Button>
                <Button variant="ghost" size="sm" onClick={termsModal.onOpen}>
                    이용약관
                </Button>
            </div>
        </div>
    )
}