import { type FC, useEffect } from "react";
import { X } from "lucide-react";

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    imageUrl?: string;
}

const ImageModal: FC<ModalProps> = ({ isOpen, onClose, imageUrl }) => {
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "unset";
        }
        return () => { document.body.style.overflow = "unset"; };
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-100 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
            onClick={onClose}
        >
            <div
                className="relative max-w-5xl w-full flex justify-center items-center cursor-default"
                onClick={(e) => e.stopPropagation()}
            >
                <img
                    src={imageUrl}
                    alt="확대 이미지"
                    className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl animate-in zoom-in-95 duration-200 bg-white"
                />

                <button
                    onClick={onClose}
                    className="absolute -top-12 right-0 md:-right-12 text-white hover:text-slate-300 transition-colors p-2"
                    aria-label="Close"
                >
                    <X size={32} />
                </button>
            </div>
        </div>
    );
};

export default ImageModal;