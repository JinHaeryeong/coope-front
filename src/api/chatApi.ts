import type { RoomType } from "@/components/provider/FriendProvider";
import axiosAuthInstance from "./axiosAuthInstance";
import type { PageResponse } from "@/types/common";


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
    lastMessage?: string; // 마지막 메시지 미리보기
    lastMessageTime?: string; // 마지막 메시지 시간
    unreadCount: number; // 안 읽은 메시지 수 (나중에 구현!)
}

export const apiCreateOrGet1on1Room = async (friendId: number) => {
    const response = await axiosAuthInstance.post<ChatRoomResponse>(`/chat/room/individual`, null, {
        params: { friendId }
    });
    return response.data;
};

export const apiCreateGroupRoom = async (userIds: number[], roomName: string) => {
    const response = await axiosAuthInstance.post<ChatRoomResponse>(`/chat/room/group`, {
        userIds,
        roomName
    });
    return response.data;
};

export const apiGetChatMessages = async (
    roomId: number,
    lastMessageId: number | null = null,
    size: number = 20
) => {
    const response = await axiosAuthInstance.get<Slice<MessageResponse>>(`/chat/room/${roomId}/messages`, {
        params: {
            lastMessageId,
            size
        }
    });
    return response.data;
};

export const apiGetMyChatRooms = async (page: number = 0, size: number = 10) => {
    const response = await axiosAuthInstance.get<PageResponse<ChatListResponse>>(`/chat/rooms`, {
        params: { page, size }
    });
    return response.data;
};

export const apiUploadChatFile = async (formData: FormData) => {
    const response = await axiosAuthInstance.post<{
        fileUrl: string,
        fileName: string,
        fileFormat: string
    }>(`/chat/upload`, formData);
    return response.data;
};

export const apiDownloadChatFile = async (fileUrl: string, fileName: string) => {
    const response = await axiosAuthInstance.get(`/chat/download`, {
        params: {
            fileUrl,
            fileName,
            category: "CHAT"
        },
        responseType: 'blob'
    });
    return response.data;
};