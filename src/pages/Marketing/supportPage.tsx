import { useState } from "react";
import { useNavigate } from "react-router-dom"; // next/navigation -> react-router-dom
import { BookOpenText, MailOpen } from "lucide-react";

import { Button } from "@/components/ui/button";
import Modal from "@/components/Marketing/Modal";
import FaqContent from "@/components/Marketing/FaqContent";

const SupportPage = () => {
    const navigate = useNavigate();
    const [isQnaModalOpen, setIsQnaModalOpen] = useState(false);

    const openQnaModal = () => setIsQnaModalOpen(true);
    const closeQnasModal = () => setIsQnaModalOpen(false);

    const redirectFunctionPage = () => {
        navigate('/function');
    }

    return (
        <div className="min-h-full flex flex-col relative box-border pt-10">
            <div className="flex flex-col items-center justify-center md:justify-start text-center gap-y-8 flex-1 px-6 pb-10">
                <header className="space-y-4 text-center box-border max-w-2xl">
                    <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight">
                        고객지원
                    </h1>
                    <p className="text-base md:text-xl text-muted-foreground break-keep">
                        Coope의 기능들을 함께 알아보고, 의문을 해결하세요
                    </p>
                </header>
                <div className="tracking-in-expand">
                    <Button onClick={redirectFunctionPage} className="cursor-pointer">
                        <BookOpenText className="mr-2" /> Coope의 기능
                    </Button>
                    <Button onClick={openQnaModal} className="mx-2 cursor-pointer">
                        <MailOpen className="mr-2" /> 자주 묻는 질문
                    </Button>
                    <div className="flex items-center justify-center">
                        <div className="relative w-87.5 h-87.5 md:w-150 md:h-150">
                            <img
                                src="/support1.webp"
                                className="object-contain w-full h-full"
                                alt="자주묻는질문"
                            />
                        </div>
                    </div>
                </div>
            </div>
            {isQnaModalOpen && (
                <Modal isOpen={isQnaModalOpen} onClose={closeQnasModal} title="자주 묻는 질문">
                    <FaqContent />
                </Modal>
            )}
        </div>
    );
}

export default SupportPage;