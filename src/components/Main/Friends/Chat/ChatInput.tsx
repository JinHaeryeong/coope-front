import { Plus, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface ChatInputProps {
    messageInput: string;
    setMessageInput: (val: string) => void;
    selectedFile: File | null;
    setSelectedFile: (file: File | null) => void;
    onSend: () => Promise<void>;
    fileInputRef: React.RefObject<HTMLInputElement | null>;
}

const ChatInput = ({
    messageInput,
    setMessageInput,
    selectedFile,
    setSelectedFile,
    onSend,
    fileInputRef
}: ChatInputProps) => {
    const [isSending, setIsSending] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        if (!selectedFile || !selectedFile.type.startsWith("image/")) {
            setPreviewUrl(null);
            return;
        }

        const url = URL.createObjectURL(selectedFile);
        setPreviewUrl(url);

        return () => URL.revokeObjectURL(url);
    }, [selectedFile]);

    const handleSendClick = async () => {
        if (isSending) return;

        setIsSending(true);
        setTimeout(() => {
            textareaRef.current?.focus();
        }, 0);
        try {
            await onSend();
        } finally {
            setIsSending(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.nativeEvent.isComposing) return;

        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSendClick();
        }
    };

    return (
        <div className="w-full bg-card p-2">
            {selectedFile && (
                <div className="mb-3 flex items-center gap-2 p-2 bg-accent rounded-lg w-fit animate-in fade-in slide-in-from-bottom-1">
                    {previewUrl && (
                        <div className="relative h-12 w-12 shadow-sm">
                            <img
                                src={previewUrl}
                                alt="preview"
                                className="object-cover rounded-md h-full w-full border"
                            />
                        </div>
                    )}
                    <span className="text-[11px] font-semibold text-muted-foreground max-w-36 truncate">
                        {selectedFile.name}
                    </span>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-destructive"
                        onClick={() => setSelectedFile(null)}
                        disabled={isSending}
                    >
                        <X className="h-3 w-3" />
                    </Button>
                </div>
            )}

            <div className="flex gap-x-2 items-center w-full">
                <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/*,.pdf,.docx,.zip"
                    onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;

                        const maxSize = 10 * 1024 * 1024;
                        if (file.size > maxSize) {
                            toast.error("파일 크기가 10MB를 초과했습니다.");
                            e.target.value = "";
                            return;
                        }

                        const allowedExtensions = /\.(png|jpe?g|gif|webp|pdf|docx|zip)$/i;
                        if (!allowedExtensions.test(file.name)) {
                            toast.error("허용되지 않는 파일 형식입니다.");
                            e.target.value = "";
                            return;
                        }

                        setSelectedFile(file);
                    }}
                />

                <Button
                    size="icon"
                    variant="ghost"
                    disabled={isSending}
                    onClick={() => fileInputRef.current?.click()}
                    className="shrink-0 h-10 w-10 bg-accent/50 hover:bg-accent transition-colors"
                >
                    <Plus className="w-5 h-5 text-muted-foreground" />
                </Button>

                <Textarea
                    ref={textareaRef}
                    placeholder={isSending ? "전송 중..." : "메시지를 입력해주세요..."}
                    className={cn(
                        "resize-none font-medium flex-1 border-none focus-visible:ring-0 bg-accent/30 rounded-xl",
                        "w-0 min-w-0",
                        "min-h-10 max-h-20 py-2.5",
                        "scrollbar-hide"
                    )}
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    disabled={isSending}
                    rows={1}
                />

                <Button
                    onClick={handleSendClick}
                    disabled={isSending || (!messageInput.trim() && !selectedFile)}
                    className="h-10 px-5 shrink-0 font-bold rounded-xl shadow-md transition-all active:scale-95"
                >
                    {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : "전송"}
                </Button>
            </div>
        </div>
    );
};

export default ChatInput;