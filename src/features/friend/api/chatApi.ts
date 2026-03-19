import type { Slice, MessageResponse, ChatRoomResponse, ChatListResponse, SliceResponse } from "../types/friend";
import axiosAuthInstance from "@/api/axiosAuthInstance";

export const apiCreateOrGet1on1Room = async (friendId: number) => {
    const response = await axiosAuthInstance.post<ChatRoomResponse>(`/chat/rooms/individual`, null, {
        params: { friendId }
    });
    return response.data;
};

export const apiCreateGroupRoom = async (userIds: number[], roomName: string) => {
    const response = await axiosAuthInstance.post<ChatRoomResponse>(`/chat/rooms/group`, {
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
    const response = await axiosAuthInstance.get<Slice<MessageResponse>>(`/chat/rooms/${roomId}/messages`, {
        params: {
            lastMessageId,
            size
        }
    });
    return response.data;
};

export const apiGetMyChatRooms = async (page: number = 0, size: number = 10) => {
    const response = await axiosAuthInstance.get<SliceResponse<ChatListResponse>>(`/chat/rooms`, {
        params: { page, size }
    });
    return response.data;
};

export const apiUploadChatFile = async (roomId: number, file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await axiosAuthInstance.post<{
        fileUrl: string,
        fileName: string,
        fileFormat: string
    }>(`/chat/rooms/${roomId}/files/upload`, formData);
    return response.data;
};

export const apiDownloadChatFile = async (roomId: number, fileUrl: string, fileName: string) => {
    const response = await axiosAuthInstance.get(`/chat/rooms/${roomId}/files/download`, {
        params: {
            fileUrl,
            fileName,
        },
        responseType: 'blob'
    });
    return response.data;
};

export const apiLeaveChatRoom = async (roomId: number) => {
    return await axiosAuthInstance.delete(`/chat/rooms/${roomId}/leave`);
};
