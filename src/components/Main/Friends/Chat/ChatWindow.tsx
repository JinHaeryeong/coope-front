import { ChevronLeft, Phone, Users, UsersRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useFriend } from "@/components/provider/FriendProvider";
import { useAuthStore } from "@/store/useAuthStore";
import ChatInput from "./ChatInput";
import { MessageItem } from "./MessageItem";

interface ChatWindowProps {
    isMobile?: boolean;
    onBack?: () => void;
}

export const ChatWindow = ({ isMobile, onBack }: ChatWindowProps) => {
    const {
        selectedRoom,
        messages,
        messageInput,
        setMessageInput,
        selectedFile,
        setSelectedFile,
        handleSendMessage,
        fileInputRef,
        bottomRef,
        setIsModalOpen
    } = useFriend();

    const user = useAuthStore((state) => state.user);

    if (!selectedRoom) {
        return;
    }

    return (
        <div className="h-full flex flex-col bg-white dark:bg-background">
            {/* 헤더: 1:1과 그룹 채팅 구별 */}
            <div className="flex justify-between items-center p-4 border-b shrink-0 shadow-sm bg-card">
                <div className="flex items-center gap-x-3">
                    {isMobile && (
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={onBack}
                            className="mr-1 -ml-2 shrink-0" // 위치 조절용 마진
                        >
                            <ChevronLeft className="h-6 w-6" />
                        </Button>
                    )}
                    <div className="bg-primary/10 p-2 rounded-lg">
                        {selectedRoom.type === "INDIVIDUAL"
                            ? <Users className="w-5 h-5 text-primary" />
                            : <UsersRound className="w-5 h-5 text-primary" />
                        }
                    </div>
                    <div>
                        <h2 className="text-base font-bold leading-none mb-1">{selectedRoom.title}</h2>
                        {!isMobile &&
                            <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">
                                {selectedRoom.type === "INDIVIDUAL" ? "Personal Chat" : "Group Chat"}
                            </span>
                        }
                    </div>
                </div>

                <div className="flex items-center gap-x-2">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setIsModalOpen(true)}
                        className="rounded-full hover:bg-primary/5 text-muted-foreground hover:text-primary transition-colors"
                    >
                        <Phone className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            {/* 메시지 목록 피드 */}
            <div className="flex-1 min-h-0 relative bg-[#F8F9FA] dark:bg-transparent">
                <ScrollArea className="h-full w-full">
                    <div className="p-6 flex flex-col gap-y-2">
                        {messages?.map((message, index) => (
                            <MessageItem
                                key={message.id}
                                message={message}
                                isMine={message.senderId === user?.id}
                                isSameSender={index > 0 && messages[index - 1].senderId === message.senderId}
                            />
                        ))}
                        <div ref={bottomRef} className="h-4" />
                    </div>
                </ScrollArea>
            </div>

            {/* 입력 영역 */}
            <div className="shrink-0 border-t p-2 bg-card">
                <ChatInput
                    messageInput={messageInput}
                    setMessageInput={setMessageInput}
                    selectedFile={selectedFile}
                    setSelectedFile={setSelectedFile}
                    onSend={handleSendMessage}
                    fileInputRef={fileInputRef}
                />
            </div>
        </div>
    );
};