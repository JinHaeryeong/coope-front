import axiosAuthInstance from "./axiosAuthInstance";

export interface MessageResponse {
    id: number;
    roomId: number;
    senderId: number;
    text: string;
    createdAt: string;
}

export interface ChatRoomResponse {
    id: number;
    // 필요한 경우 상대방 정보 등을 추가
}

export const apiCreateOrGet1on1Room = async (friendId: number) => {
    const response = await axiosAuthInstance.post<ChatRoomResponse>(`/chat/room/1on1`, null, {
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

export const apiGetChatMessages = async (roomId: number) => {
    const response = await axiosAuthInstance.get<MessageResponse[]>(`/chat/room/${roomId}/messages`);
    return response.data;
};