
import { createContext, useState, useRef, type ReactNode, useEffect, useContext } from "react";
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
    fetchChatRooms: (isMore?: boolean) => Promise<void>;
    hasMoreRooms: boolean;
    fetchMoreMessages: () => Promise<void>;
    hasMoreMessages: boolean;
    isFetchingMore: boolean;
}

const FriendContext = createContext<FriendContextType | null>(null);

export const FriendProvider = ({ children, initialFriends }: { children: ReactNode; initialFriends: FriendResponse[] }) => {
    const { user } = useAuthStore();
    const { stompClient, isConnected } = useSocket();
    const [selectedRoom, setSelectedRoom] = useState<SelectedRoom | null>(null);
    const [messages, setMessages] = useState<MessageResponse[]>([]);
    const [messageInput, setMessageInput] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [chatRooms, setChatRooms] = useState<ChatListResponse[]>([]);
    const [page, setPage] = useState(0);
    const [hasMoreRooms, setHasMoreRooms] = useState(true);
    const [friendsList, setFriendsList] = useState<FriendResponse[]>(initialFriends);
    const { fetchFriends } = useFriendStore();
    const storeFriends = useFriendStore((state) => state.friends);

    const bottomRef = useRef<HTMLDivElement | null>(null);
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [messagePage, setMessagePage] = useState(0);
    const [hasMoreMessages, setHasMoreMessages] = useState(true);
    const [isFetchingMore, setIsFetchingMore] = useState(false);
    const isInitialLoadRef = useRef(true);

    useEffect(() => {
        setFriendsList(storeFriends);
    }, [storeFriends]);

    useEffect(() => {
        if (user && isConnected) {
            fetchChatRooms();
            fetchFriends(true);
        }
    }, [user, isConnected]);

    // 방이 선택될 때마다 실행되는 통합 로직
    useEffect(() => {
        if (!selectedRoom?.roomId) {
            setMessages([]);
            setMessagePage(0);
            setHasMoreMessages(true);
            isInitialLoadRef.current = true;
            return;
        }

        const fetchInitialMessages = async () => {
            setIsFetchingMore(true);
            try {
                const data = await apiGetChatMessages(selectedRoom.roomId, 0);
                setMessages([...data.content].reverse());
                setMessagePage(0);
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
                            const isAlreadyExists = prev.some((msg) => msg.id === newMessage.id);
                            if (isAlreadyExists) return prev; // 이미 있으면 추가 안 함
                            return [...prev, newMessage];
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
            const nextPage = messagePage + 1;
            const data = await apiGetChatMessages(selectedRoom.roomId, nextPage);
            const reversedPast = [...data.content].reverse();

            setMessages(prev => [...reversedPast, ...prev]);
            setMessagePage(nextPage);
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

    const fetchChatRooms = async (isMore = false) => {
        try {
            const currentPage = isMore ? page + 1 : 0;
            const data = await apiGetMyChatRooms(currentPage, 10);

            const { content, last: isLast } = data;

            if (isMore) {
                setChatRooms(prev => [...prev, ...content]);
                setPage(currentPage);
            } else {
                setChatRooms(content);
                setPage(0);
            }

            setHasMoreRooms(!isLast);
        } catch (error) {
            console.error("채팅방 목록 로드 실패:", error);
            toast.error("채팅방 목록을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.");
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
        fetchChatRooms,
        hasMoreRooms,
        fetchMoreMessages,
        hasMoreMessages,
        isFetchingMore
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