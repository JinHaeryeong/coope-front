import { useLoginModal } from "@/hooks/useLoginModal";
import { usePrivacyModal } from "@/hooks/usePrivacyModal";
import { useQnaModal } from "@/hooks/useQnaModal";
import { useTermsModal } from "@/hooks/useTermsModal";
import { lazy, Suspense, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

const Modal = lazy(() => import("@/components/Marketing/Modal"));
const LoginForm = lazy(() =>
    import("../Auth/LoginForm").then(module => ({ default: module.LoginForm }))
);
const FaqContent = lazy(() => import("@/components/Marketing/FaqContent"));
const Policy = lazy(() => import("@/components/Marketing/Policy"));
const Term = lazy(() => import("@/components/Marketing/Term"));

export const ModalProvider = () => {
    const { pathname } = useLocation();
    const loginModal = useLoginModal();
    const qnaModal = useQnaModal();
    const termsModal = useTermsModal();
    const privacyModal = usePrivacyModal();
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);
    useEffect(() => {
        loginModal.onClose();
        qnaModal.onClose();
        termsModal.onClose();
        privacyModal.onClose();
    }, [pathname]);

    if (!isMounted) return null;

    return (
        <Suspense fallback={null}>
            <Modal
                isOpen={loginModal.isOpen}
                onClose={loginModal.onClose}
                title="로그인"
            >
                <div className="flex flex-col gap-y-4">
                    <LoginForm />
                </div>
            </Modal>

            <Modal isOpen={qnaModal.isOpen} onClose={qnaModal.onClose} title="자주 묻는 질문">
                <FaqContent />
            </Modal>


            <Modal isOpen={privacyModal.isOpen} onClose={privacyModal.onClose} title="개인정보 정책">
                <Policy />
            </Modal>

            <Modal isOpen={termsModal.isOpen} onClose={termsModal.onClose} title="이용약관">
                <Term />
            </Modal>
        </Suspense>
    );
};