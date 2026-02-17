import { Button } from "@/components/ui/button";
import React, { useRef } from "react";
import { Expand, Minus, PhoneOff, Square, SquareArrowOutDownLeft, X } from "lucide-react";
import Draggable from "react-draggable";
import { useCallStore } from "@/store/useCallStore"; // 스토어 임포트
import WebRtcComponent from "./WebRtcComponent";

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    roomId: string;
}

const CallModal: React.FC<ModalProps> = ({ isOpen, onClose, roomId }) => {
    const { isMinimized, setMinimized, isFullScreen, setIsFullScreen } = useCallStore();
    const draggableRef = useRef<HTMLDivElement>(null);

    // 열려있지 않거나 최소화 상태도 아니라면 아무것도 그리지 않음
    if (!isOpen && !isMinimized) return null;

    return (
        <>
            {/* 메인 통화 화면: 최소화 모드가 아닐 때만 보임 */}
            <div
                className={`
          fixed inset-0 z-90 transition-all duration-300
          ${isMinimized ? "hidden" : "flex items-center justify-center bg-black/60 backdrop-blur-sm"}
        `}
            >
                <div
                    className={`
            relative transition-all duration-300 border bg-white dark:bg-neutral-900 shadow-2xl flex flex-col
            ${isFullScreen
                            ? "w-screen h-screen rounded-none"
                            : "w-full md:w-8/12 lg:w-5/12 h-[85vh] max-h-212.5 rounded-sm md:rounded-2xl p-6"
                        }
          `}
                >
                    {!isFullScreen && (
                        <div className="flex justify-between items-center mb-4 shrink-0">
                            <h2 className="text-xl font-bold">통화</h2>
                        </div>
                    )}

                    <div className="flex-1 min-h-0 w-full relative">
                        <WebRtcComponent
                            roomId={roomId}
                        />
                    </div>

                    <div className="text-right space-x-2 mt-4">
                        {/* 최소화 버튼: setMinimized(true) 실행 */}
                        <Button variant="ghost" size="icon" onClick={() => setMinimized(true)} className="hidden md:inline-flex">
                            <Minus />
                        </Button>
                        {/* 전체화면 토글 */}
                        <Button variant="ghost" size="icon" onClick={() => setIsFullScreen(!isFullScreen)}>
                            {isFullScreen ? <SquareArrowOutDownLeft /> : <Square />}
                        </Button>
                        <Button variant="ghost" size="icon" onClick={onClose}>
                            <X />
                        </Button>
                    </div>
                </div>
            </div>

            {/* 최소화된 플로팅 바: 드래그 가능 */}
            {isMinimized && (
                <Draggable nodeRef={draggableRef as React.RefObject<HTMLElement>}>
                    <div ref={draggableRef} className="fixed bottom-4 right-4 z-99 bg-neutral-900 text-white rounded-lg shadow-lg px-4 py-2 flex items-center space-x-3 cursor-move">
                        <span className="text-sm font-medium animate-pulse text-green-400">● 통화 중...</span>
                        <Button size="icon" variant="ghost" className="hover:bg-white/10" onClick={() => setMinimized(false)}>
                            <Expand className="w-4 h-4" />
                        </Button>
                        <Button size="icon" variant="ghost" className="hover:bg-red-500/20 text-red-500" onClick={onClose}>
                            <PhoneOff className="w-4 h-4" />
                        </Button>
                    </div>
                </Draggable>
            )}
        </>
    );
};

export default CallModal;