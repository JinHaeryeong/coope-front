import type { FC, ReactNode } from "react";
import { Button } from "../ui/button";


interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}
const Modal: FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-[999]">
      <div className="bg-background dark:bg-[#1F1F1F] p-6 rounded-xl w-full max-w-md shadow-2xl border border-border">
        <div className="flex justify-between items-center mb-6 ">
          <h2 className="text-xl font-bold text-foreground">{title}</h2>
        </div>
        <div className="mb-6 text-foreground overflow-y-auto">
          {children}
        </div>
        <div className="flex justify-end">
          <Button variant="default" onClick={onClose} className="cursor-pointer">닫기</Button>
        </div>
      </div>
    </div>
  );
};
export default Modal;
