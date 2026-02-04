import Modal from "@/components/Marketing/Modal";
import { useLoginModal } from "@/hooks/useLoginModal";
import { LoginForm } from "../Auth/LoginForm";

export const ModalProvider = () => {
    const loginModal = useLoginModal();


    return (
        <>
            <Modal
                isOpen={loginModal.isOpen}
                onClose={loginModal.onClose}
                title="로그인"
            >
                <div className="flex flex-col gap-y-4">
                    <LoginForm />
                </div>
            </Modal>

            {/* TODO: 나중에 추가될 다른 모달들 (예: 설정모달, 검색모달 등)도 여기에 추가 */}
        </>
    );
};