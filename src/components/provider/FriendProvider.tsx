
import { createContext, useState, useRef, type ReactNode, useEffect, useContext, useCallback } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { apiGetChatMessages, apiCreateOrGet1on1Room, apiGetMyChatRooms, apiUploadChatFile } from "@/api/chatApi";
import type { FriendResponse } from "@/api/friendApi";
import type { ChatListResponse, MessageResponse } from "@/api/chatApi";
import { useSocket } from "@/hooks/useSocket";
import { useFriendStore } from "@/store/useFriendStore";
import { type StompSubscription } from "@stomp/stompjs";
import { toast } from "sonner";

export type RoomType = "INDIVIDUAL" | "GROUP";

// 선택된 방의 타입 (1:1 / 단체 공용)
interface SelectedRoom {
    roomId: number;
    title: string;
    userIcon?: string;
    type: RoomType;
}

interface FriendContextType {
    friendsList: FriendResponse[];
    selectedRoom: SelectedRoom | null;
    setSelectedRoom: (room: SelectedRoom | null) => void;
    messages: MessageResponse[];
    messageInput: string;
    setMessageInput: (value: string) => void;
    onFriendClick: (friend: FriendResponse) => Promise<void>;
    handleSendMessage: () => Promise<void>;
    bottomRef: React.RefObject<HTMLDivElement | null>;
    selectedFile: File | null;
    setSelectedFile: (file: File | null) => void;
    fileInputRef: React.RefObject<HTMLInputElement | null>;
    isModalOpen: boolean;
    setIsModalOpen: (value: boolean) => void;
    chatRooms: ChatListResponse[];
    setChatRooms: React.Dispatch<React.SetStateAction<ChatListResponse[]>>;
    fetchChatRooms: (isMore?: boolean) => Promise<void>;
    hasMoreRooms: boolean;
    fetchMoreMessages: () => Promise<void>;
    hasMoreMessages: boolean;
    isFetchingMore: boolean;
    closeChatWindow: (roomId: number) => void;
}

const FriendContext = createContext<FriendContextType | null>(null);

export const FriendProvider = ({ children }: { children: ReactNode }) => {
    const { user } = useAuthStore();
    const { stompClient, isConnected } = useSocket();
    const [selectedRoom, setSelectedRoom] = useState<SelectedRoom | null>(null);
    const [messages, setMessages] = useState<MessageResponse[]>([]);
    const [messageInput, setMessageInput] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [chatRooms, setChatRooms] = useState<ChatListResponse[]>([]);
    const [hasMoreRooms, setHasMoreRooms] = useState(true);
    const friendsList = useFriendStore(state => state.friends);
    const { fetchFriends: fetchFriendsFromStore, setIsChatActive } = useFriendStore();

    const bottomRef = useRef<HTMLDivElement | null>(null);
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [hasMoreMessages, setHasMoreMessages] = useState(true);
    const [isFetchingMore, setIsFetchingMore] = useState(false);
    const isInitialLoadRef = useRef(true);
    const pageRef = useRef(0);

    const fetchFriends = useCallback(async (silent = false) => {
        await fetchFriendsFromStore(silent);
    }, [fetchFriendsFromStore]);


    const fetchChatRooms = useCallback(async (isMore = false) => {
        try {
            const targetPage = isMore ? pageRef.current + 1 : 0;
            const data = await apiGetMyChatRooms(targetPage, 10);
            const { content, last: isLast } = data;

            if (isMore) {
                setChatRooms(prev => {
                    const newRooms = content.filter(
                        room => !prev.some(r => r.roomId === room.roomId)
                    );
                    return [...prev, ...newRooms];
                });
                pageRef.current = targetPage;
            } else {
                setChatRooms(content);
                pageRef.current = 0;
            }
            setHasMoreRooms(!isLast);
        } catch (error) {
            console.error("채팅방 목록 로드 실패:", error);
        }
    }, []);
    useEffect(() => {
        if (!user) return;

        fetchChatRooms();
        fetchFriends(true);
    }, [user, fetchChatRooms, fetchFriends]);

    useEffect(() => {
        if (!isConnected || !stompClient || !user) return;

        const globalSub = stompClient.subscribe(
            `/user/queue/chat/updates`,
            (message) => {
                const updatedRoomInfo = JSON.parse(message.body);

                setChatRooms(prev => {
                    const roomExists = prev.find(r => r.roomId === updatedRoomInfo.roomId);
                    const others = prev.filter(r => r.roomId !== updatedRoomInfo.roomId);

                    if (roomExists) {
                        return [
                            {
                                ...roomExists,
                                lastMessage: updatedRoomInfo.lastMessage,
                                lastMessageTime: updatedRoomInfo.lastMessageTime
                            },
                            ...others
                        ];
                    } else {
                        fetchChatRooms(false);
                        return prev;
                    }
                });
            }
        );

        return () => globalSub.unsubscribe();
    }, [isConnected, stompClient, user, fetchChatRooms]);

    // 방이 선택될 때마다 실행되는 통합 로직
    useEffect(() => {
        setIsChatActive(!!selectedRoom?.roomId);
        if (!selectedRoom?.roomId) {
            setMessages([]);
            setHasMoreMessages(true);
            isInitialLoadRef.current = true;
            return;
        }

        const fetchInitialMessages = async () => {
            setIsFetchingMore(true);
            try {
                // 첫 로딩 시에는 커서(lastMessageId)를 null로 보냄
                const data = await apiGetChatMessages(selectedRoom.roomId, null);
                setMessages([...data.content].reverse());

                setHasMoreMessages(!data.last);
            } catch (error) {
                console.error(error);
            } finally {
                setIsFetchingMore(false);
                isInitialLoadRef.current = false;
            }
        };

        fetchInitialMessages();

        // 실시간 메시지 구독 (STOMP)
        let subscription: StompSubscription | undefined;
        if (isConnected && stompClient && selectedRoom?.roomId) {
            try {
                console.log(`${selectedRoom.roomId}번 방 구독 시작`);

                subscription = stompClient.subscribe(
                    `/topic/chat/${selectedRoom.roomId}`,
                    (message) => {
                        const newMessage: MessageResponse = JSON.parse(message.body);

                        setMessages((prev) => {
                            if (prev.some((msg) => msg.id === newMessage.id)) return prev;
                            return [...prev, newMessage];
                        });

                        if (newMessage.type === "LEAVE" && newMessage.senderId === user?.id) {
                            closeChatWindow(newMessage.roomId);
                            return;
                        }

                        setChatRooms(prev => {
                            const updatedRoom = prev.find(r => r.roomId === newMessage.roomId);
                            if (!updatedRoom) return prev;
                            const others = prev.filter(r => r.roomId !== newMessage.roomId);
                            return [
                                {
                                    ...updatedRoom,
                                    lastMessage: newMessage.content,
                                    lastMessageTime: newMessage.createdAt,
                                },
                                ...others
                            ];
                        });
                    }
                );
            } catch (error) {
                console.error(`${selectedRoom.roomId}번 방 구독 중 오류:`, error);
                toast.error("실시간 연결에 실패했습니다. 메시지 수신이 늦어질 수 있습니다.");
            }
        } else if (!isConnected && selectedRoom?.roomId) {
            console.warn("WebSocket 연결 대기 중...");
        }

        // Cleanup: 방을 나갈 때 구독 해제
        return () => {
            if (subscription) {
                console.log(`${selectedRoom.roomId}번 방 구독 해제`);
                subscription?.unsubscribe();
            }
        };
    }, [selectedRoom?.roomId, stompClient, isConnected]);

    const fetchMoreMessages = async () => {
        if (!hasMoreMessages || isFetchingMore || !selectedRoom?.roomId) return;

        setIsFetchingMore(true);
        try {
            const lastMessageId = messages.length > 0 ? messages[0].id : null;

            const data = await apiGetChatMessages(selectedRoom.roomId, lastMessageId);

            const reversedPast = [...data.content].reverse();

            setMessages(prev => [...reversedPast, ...prev]);

            setHasMoreMessages(!data.last);
        } catch (error) {
            console.error("이전 메시지 로드 실패:", error);
        } finally {
            setIsFetchingMore(false);
        }
    };

    // 친구 클릭 시 방 입장
    const onFriendClick = async (friend: FriendResponse) => {
        if (!user) return;
        try {
            const roomData = await apiCreateOrGet1on1Room(friend.friendId);

            await fetchChatRooms(false);
            setSelectedRoom({
                roomId: roomData.roomId,
                title: roomData.title,
                userIcon: friend.userIcon,
                type: "INDIVIDUAL"
            });
        } catch (error) {
            console.error("방 입장 에러:", error);
            toast.error("방 입장에 실패했습니다. 잠시 후 다시 시도해주세요.");
        }
    };


    // 메시지 전송 (publish 사용)
    const handleSendMessage = async () => {
        if ((!messageInput.trim() && !selectedFile) || !selectedRoom?.roomId || !user || !stompClient) return;

        try {
            let fileUrl: string | undefined = undefined;
            let fileName: string | undefined = undefined;
            let fileFormat: string | undefined = undefined;

            if (selectedFile) {
                const formData = new FormData();
                formData.append("file", selectedFile);

                const uploadRes = await apiUploadChatFile(formData);
                fileUrl = uploadRes.fileUrl;
                fileName = uploadRes.fileName;
                fileFormat = uploadRes.fileFormat;
            }

            const chatPayload = {
                roomId: selectedRoom.roomId,
                senderId: user.id,
                content: messageInput,
                fileUrl: fileUrl,
                fileName: fileName,
                fileFormat: fileFormat,
            };

            // STOMP를 통해 실시간 전송
            stompClient.publish({
                destination: "/app/chat/send",
                body: JSON.stringify(chatPayload),
            });

            // 성공 시 초기화
            setMessageInput("");
            setSelectedFile(null);
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }

        } catch (error) {
            console.error("전송 에러:", error);
            toast.error("메시지 전송에 실패했습니다.");
        }
    };

    // 방 나가기
    const closeChatWindow = useCallback((roomId: number) => {
        // 1. 현재 선택된 방 비우기
        setSelectedRoom(null);

        // 2. 메시지 목록 초기화
        setMessages([]);

        // 3. 채팅방 목록(Sidebar용)에서 해당 방 제거
        setChatRooms(prev => prev.filter(room => room.roomId !== roomId));

        // 4. 추가 팁: 만약 해당 방 소켓을 명시적으로 끊어야 한다면 여기서 처리!
    }, []);

    const value: FriendContextType = {
        friendsList,
        selectedRoom,
        setSelectedRoom,
        messages,
        messageInput,
        setMessageInput,
        onFriendClick,
        handleSendMessage,
        bottomRef,
        selectedFile,
        setSelectedFile,
        fileInputRef,
        isModalOpen,
        setIsModalOpen,
        chatRooms,
        setChatRooms,
        fetchChatRooms,
        hasMoreRooms,
        fetchMoreMessages,
        hasMoreMessages,
        isFetchingMore,
        closeChatWindow,
    };

    return <FriendContext.Provider value={value}>{children}</FriendContext.Provider>;
};

export const useFriend = () => {
    const context = useContext(FriendContext);

    // 만약 Provider 밖에서 이 훅을 쓰려고 하면 에러를 던져서 알려줌
    if (!context) {
        throw new Error("useFriend는 반드시 FriendProvider 안에서 사용해야 합니다!");
    }

    return context;
};