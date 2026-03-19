export type FriendStatus = "PENDING" | "ACCEPTED" | "REJECTED";

export interface FriendResponse {
    id: number;
    friendId: number;
    nickname: string;
    userIcon: string;
    status: FriendStatus;
}

// Chat related types
export type RoomType = "INDIVIDUAL" | "GROUP";
export type MessageType = "TALK" | "ENTER" | "LEAVE";

export interface Slice<T> {
    content: T[];
    last: boolean;
}

export interface MessageResponse {
    id: number;
    roomId: number;
    senderId: number;
    senderNickname: string;
    senderProfile?: string;
    content: string;
    type: MessageType;
    fileUrl?: string;
    fileName?: string;
    fileFormat?: string;
    createdAt: string;
}

export interface ChatRoomResponse {
    roomId: number;
    title: string;
    type: RoomType;
}

export interface ChatListResponse {
    roomId: number;
    title: string;
    type: RoomType;
    lastMessage?: string;
    lastMessageTime?: string;
    unreadCount: number;
}

export interface SliceResponse<T> {
    content: T[];
    last: boolean;
    size: number;
    number: number;
    first: boolean;
    numberOfElements: number;
    empty: boolean;
}
