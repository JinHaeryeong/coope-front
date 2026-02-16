import { ChevronLeft, Phone, Users, UsersRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useFriend } from "@/components/provider/FriendProvider";
import { useAuthStore } from "@/store/useAuthStore";
import ChatInput from "./ChatInput";
import { MessageItem } from "./MessageItem";
import { useEffect, useLayoutEffect, useRef, useState } from "react";

interface ChatWindowProps {
    isMobile?: boolean;
    onBack?: () => void;
}

export const ChatWindow = ({ isMobile, onBack }: ChatWindowProps) => {
    const {
        selectedRoom, messages, isFetchingMore, fetchMoreMessages, hasMoreMessages, bottomRef, setIsModalOpen,
        messageInput, setMessageInput, selectedFile, setSelectedFile, handleSendMessage, fileInputRef
    } = useFriend();

    const user = useAuthStore((state) => state.user);
    const scrollRef = useRef<HTMLDivElement>(null);
    const topRef = useRef<HTMLDivElement>(null);
    const prevScrollHeightRef = useRef<number>(0);
    const isInitialScrollDone = useRef(false);
    const [showNewMessageButton, setShowNewMessageButton] = useState(false);
    const isUserAtBottomRef = useRef(true);
    const lastMessage = messages[messages.length - 1];
    const isLastMessageMine = lastMessage?.senderId === user?.id;


    useEffect(() => {
        const container = scrollRef.current;
        if (!container) return;

        const handleScroll = () => {
            const threshold = 50;
            const isAtBottom =
                container.scrollHeight - container.scrollTop - container.clientHeight < threshold;

            isUserAtBottomRef.current = isAtBottom;

            if (isAtBottom) {
                setShowNewMessageButton(false);
            }
        };

        container.addEventListener("scroll", handleScroll);
        return () => container.removeEventListener("scroll", handleScroll);
    }, []);


    useEffect(() => {
        isInitialScrollDone.current = false;
        prevScrollHeightRef.current = 0;
    }, [selectedRoom?.roomId]);

    useLayoutEffect(() => {
        const container = scrollRef.current;
        if (!container) return;

        if (!isFetchingMore && prevScrollHeightRef.current > 0) {
            container.scrollTop =
                container.scrollHeight - prevScrollHeightRef.current;
            prevScrollHeightRef.current = 0;
            return;
        }

        if (!isInitialScrollDone.current && messages.length > 0) {
            requestAnimationFrame(() => {
                container.scrollTop = container.scrollHeight;
            });
            isInitialScrollDone.current = true;
        }

        if (isInitialScrollDone.current && messages.length > 0 && !isFetchingMore) {

            if (isLastMessageMine) {
                container.scrollTop = container.scrollHeight;
                setShowNewMessageButton(false);
                return;
            }
            if (isUserAtBottomRef.current) {
                container.scrollTop = container.scrollHeight;
            } else {
                setShowNewMessageButton(true);
            }
        }

    }, [messages, isFetchingMore]);


    useEffect(() => {
        if (!topRef.current || !scrollRef.current) return;

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && hasMoreMessages && !isFetchingMore) {
                    prevScrollHeightRef.current = scrollRef.current!.scrollHeight;
                    fetchMoreMessages();
                }
            },
            {
                root: scrollRef.current,
                rootMargin: "100px 0px 0px 0px"
            }
        );

        observer.observe(topRef.current);
        return () => observer.disconnect();
    }, [hasMoreMessages, isFetchingMore, selectedRoom?.roomId]);

    if (!selectedRoom) return null;

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
                            className="mr-1 -ml-2 shrink-0"
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
            <div className="flex-1 min-h-0 relative bg-[#F8F9FA] dark:bg-transparent overflow-hidden">
                <div
                    ref={scrollRef}
                    className="h-full w-full overflow-y-auto [overflow-anchor:none]"
                >
                    <div className="px-6 py-4 flex flex-col gap-y-2">
                        <div ref={topRef} className="h-10 w-full shrink-0" />

                        {isFetchingMore && (
                            <div className="text-center text-[10px] text-muted-foreground py-2">
                                이전 대화 불러오는 중...
                            </div>
                        )}

                        {messages.map((message, index) => (
                            <MessageItem
                                key={message.id}
                                message={message}
                                isMine={message.senderId === user?.id}
                                isSameSender={index > 0 && messages[index - 1].senderId === message.senderId}
                            />
                        ))}
                        {showNewMessageButton && (
                            <div className="sticky bottom-4 flex justify-center">
                                <button
                                    onClick={() => {
                                        scrollRef.current!.scrollTop =
                                            scrollRef.current!.scrollHeight;
                                        setShowNewMessageButton(false);
                                    }}
                                    className="bg-primary text-white text-xs px-4 py-2 rounded-full shadow-lg transition-all hover:scale-105"
                                >
                                    새 메시지 ▼
                                </button>
                            </div>
                        )}
                        <div ref={bottomRef} className="h-1 shrink-0" />
                    </div>
                </div>
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