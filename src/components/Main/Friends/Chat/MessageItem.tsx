import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { apiDownloadChatFile, type MessageResponse } from "@/api/chatApi";
import { cn } from "@/lib/utils";
import { File } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";
import ImageModal from "@/components/Marketing/ImageModal";

interface MessageItemProps {
    message: MessageResponse;
    isMine: boolean;
    isSameSender: boolean;
}

export const MessageItem = ({
    message,
    isMine,
    isSameSender,
}: MessageItemProps) => {
    const formattedTime = new Intl.DateTimeFormat("ko-KR", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
    }).format(new Date(message.createdAt));
    const isImage = message.fileFormat?.startsWith("image/");
    const [isImageModalOpen, setIsImageModalOpen] = useState(false);

    const handleDownload = async () => {
        try {
            const blob = await apiDownloadChatFile(message.fileUrl || "", message.fileName || "file");
            const url = window.URL.createObjectURL(new Blob([blob]));
            const link = document.createElement('a');
            link.href = url;

            link.setAttribute('download', message.fileName || 'download');
            document.body.appendChild(link);
            link.click();

            link.parentNode?.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error("다운로드 실패:", error);
            toast.error("파일 다운로드에 실패했습니다.");
        }
    };


    if (message.type === "ENTER" || message.type === "LEAVE") {
        return (
            <div className="flex justify-center w-full my-6 px-4 animate-in fade-in slide-in-from-top-1 duration-300">
                <span className="
                bg-neutral-100/80 dark:bg-neutral-800/80 
                backdrop-blur-sm 
                text-neutral-500 dark:text-neutral-400 
                text-[10px] sm:text-[11px] 
                px-5 py-1.5 
                rounded-full 
                font-medium 
                shadow-sm 
                border border-neutral-200/50 dark:border-neutral-700/50
                transition-all
            ">
                    {message.content}
                </span>
            </div>
        );
    }

    return (
        <>
            <article className={cn(
                "flex flex-col gap-y-1 mb-2",
                isMine ? "items-end" : "items-start"
            )}>
                {/* 보낸 사람 프로필 (연속된 메시지가 아닐 때만 노출) */}
                {!isSameSender && !isMine && (
                    <div className="flex items-center gap-x-2 mb-1">
                        <Avatar className="h-7 w-7 border shadow-sm">
                            <AvatarImage src={message.senderProfile} />
                            <AvatarFallback className="text-[10px] bg-primary/10">
                                {message.senderNickname || "?"}
                            </AvatarFallback>
                        </Avatar>
                        <span className="text-xs font-bold text-muted-foreground">
                            {message.senderNickname || "알 수 없음"}
                        </span>
                    </div>
                )}

                <div className={cn(
                    "flex items-end gap-x-2 max-w-[75%]",
                    isMine ? "flex-row-reverse" : "flex-row"
                )}>
                    <div className={cn(
                        "px-4 py-2.5 rounded-2xl shadow-sm text-sm break-all",
                        isMine
                            ? "bg-primary text-primary-foreground rounded-tr-none"
                            : "bg-card text-foreground border rounded-tl-none"
                    )}>
                        {message.fileUrl && (
                            <div>
                                {isImage ? (
                                    <img
                                        src={message.fileUrl}
                                        alt={
                                            message.content
                                                ? `이미지 메시지: ${message.content}`
                                                : `${message.fileName?.split('.')[0] || '채팅 이미지'}`
                                        }
                                        className="w-60 h-60 object-cover cursor-pointer"
                                        onClick={() => setIsImageModalOpen(true)}

                                    />
                                ) : (
                                    <div
                                        onClick={handleDownload}
                                        className="flex items-center gap-x-2 p-2 transition group hover:bg-black/5 rounded-md text-left w-full cursor-pointer active:scale-95"
                                    >
                                        <div className="p-1.5 rounded border bg-background group-hover:bg-accent">
                                            <File className="w-4 h-4 text-muted-foreground" />
                                        </div>
                                        <div className="flex flex-col truncate">
                                            <span className="font-bold truncate max-w-30 text-xs">
                                                {message.fileName || "파일 다운로드"}
                                            </span>
                                            <span className="text-[10px] opacity-60 uppercase">
                                                {message.fileFormat?.split('/')[1] || "FILE"}
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* 텍스트 내용 (내용이 있을 때만 렌더링) */}
                        {message.content && (
                            <p className="leading-relaxed font-medium">
                                {message.content}
                            </p>
                        )}
                    </div>

                    {/* 시간 표시 (말풍선 옆에 작게) */}
                    <span className="text-[9px] text-muted-foreground whitespace-nowrap mb-1">
                        {formattedTime}
                    </span>
                </div>
            </article>
            <ImageModal
                isOpen={isImageModalOpen}
                onClose={() => setIsImageModalOpen(false)}
                imageUrl={message.fileUrl}
            />
        </>
    );
};