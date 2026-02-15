import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { apiDownloadChatFile, type MessageResponse } from "@/api/chatApi";
import { cn } from "@/lib/utils";
import { File } from "lucide-react";
import { toast } from "sonner";

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

    return (
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
                                    alt={message.fileName || "image"}
                                    className="w-full max-w-60 aspect-square object-cover cursor-pointer"
                                    onClick={() => window.open(message.fileUrl, "_blank")}
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
    );
};