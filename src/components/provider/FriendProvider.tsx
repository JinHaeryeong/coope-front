
import { createContext, useContext, useState, useRef, type ReactNode, useEffect } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { apiGetChatMessages, apiCreateOrGet1on1Room } from "@/api/chatApi";
import type { FriendResponse } from "@/api/friendApi";
import type { MessageResponse } from "@/api/chatApi";

// 선택된 방의 타입 (1:1 / 단체 공용)
interface SelectedRoom {
    roomId: number;       // MySQL PK (Long -> number)
    title: string;        // 친구 닉네임 혹은 단체방 이름
    userIcon?: string;
    isGroup: boolean;
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
    fileInputRef: React.RefObject<HTMLInputElement | null>;
    isModalOpen: boolean;
    setIsModalOpen: (value: boolean) => void;
}

const FriendContext = createContext<FriendContextType | null>(null);

export const FriendProvider = ({ children, initialFriends }: { children: ReactNode; initialFriends: FriendResponse[] }) => {
    const { user } = useAuthStore(); // 💡 Spring Boot에서 인증받은 내 정보
    const [selectedRoom, setSelectedRoom] = useState<SelectedRoom | null>(null);
    const [messages, setMessages] = useState<MessageResponse[]>([]);
    const [messageInput, setMessageInput] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);

    const bottomRef = useRef<HTMLDivElement | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // 방이 선택될 때마다 과거 메시지 내역 로드 (MySQL 조회)
    useEffect(() => {
        const fetchMessages = async () => {
            if (!selectedRoom?.roomId) {
                setMessages([]);
                return;
            }
            try {
                const data = await apiGetChatMessages(selectedRoom.roomId);
                setMessages(data);

                // 여기서 WebSocket(STOMP) 구독 로직이 추가될 자리입니다!
            } catch (error) {
                console.error("메시지 로딩 실패:", error);
            }
        };

        fetchMessages();
    }, [selectedRoom?.roomId]);

    // 새 메시지 올 때마다 자동 스크롤
    useEffect(() => {
        if (messages.length > 0) {
            setTimeout(() => {
                bottomRef.current?.scrollIntoView({ behavior: "smooth" });
            }, 100);
        }
    }, [messages]);

    // 친구 클릭 시 채팅방 열기 (1:1)
    const onFriendClick = async (friend: FriendResponse) => {
        if (!user) return;
        try {
            // Spring Boot API 호출: 방이 없으면 생성, 있으면 조회
            const roomData = await apiCreateOrGet1on1Room(friend.friendId);

            setSelectedRoom({
                roomId: roomData.id,
                title: friend.nickname,
                userIcon: friend.userIcon,
                isGroup: false
            });
        } catch (error) {
            console.error("방 입장 에러:", error);
        }
    };

    // 메시지 전송 로직 (REST 혹은 WebSocket)
    const handleSendMessage = async () => {
        if (!messageInput.trim() || !selectedRoom?.roomId || !user) return;

        try {
            // 실제 서비스에선 여기서 STOMP(WebSocket) publish를 쓰겠지만, 
            // 일단 구조만 잡아둡니다.
            console.log(`${selectedRoom.roomId}번 방으로 전송: ${messageInput}`);

            setMessageInput("");
            // 전송 후 스크롤 하단으로
            bottomRef.current?.scrollIntoView({ behavior: "smooth" });
        } catch (error) {
            console.error("메시지 전송 실패:", error);
        }
    };

    const value: FriendContextType = {
        friendsList: initialFriends,
        selectedRoom,
        setSelectedRoom,
        messages,
        messageInput,
        setMessageInput,
        onFriendClick,
        handleSendMessage,
        bottomRef,
        fileInputRef,
        isModalOpen,
        setIsModalOpen,
    };

    return <FriendContext.Provider value={value}>{children}</FriendContext.Provider>;
};

export const useFriend = () => {
    const context = useContext(FriendContext);
    if (!context) throw new Error("useFriend must be used within a FriendProvider");
    return context;
};